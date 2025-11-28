/**
 * Streaming Analysis Routes
 * Progressive Data Loading için SSE endpoint'leri
 * 
 * Güvenlik: aiRateLimiter parent router'da uygulanıyor (10 req/min)
 * Her kullanıcı dakikada maksimum 10 streaming request yapabilir
 */

import { Router, RequestHandler, Request } from 'express';
import { ProgressiveAnalysisService } from '../../../services/progressive-analysis.service.js';
import PsychologicalDepthAnalysisService from '../../../services/psychological-depth-analysis.service.js';
import PredictiveRiskTimelineService from '../../../services/predictive-risk-timeline.service.js';
import StudentTimelineAnalyzerService from '../../../services/student-timeline-analyzer.service.js';
import type { StreamChunk } from '../../../../shared/types/progressive-loading.types.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

const router = Router();
router.use(validateSchoolAccess);
const progressiveService = new ProgressiveAnalysisService();
const psychologicalService = new PsychologicalDepthAnalysisService();
const predictiveService = new PredictiveRiskTimelineService();
const timelineService = new StudentTimelineAnalyzerService();

// Connection tracking (prevent DoS)
const activeConnections = new Map<string, number>();
const MAX_CONCURRENT_STREAMS = 3; // Kullanıcı başına max 3 eşzamanlı stream

/**
 * GET /api/advanced-ai-analysis/stream/:studentId
 * Progressive data loading endpoint
 * 
 * Server-Sent Events kullanarak veriyi aşamalı olarak yükler:
 * 1. Basic info (50ms)
 * 2. Academic summary (200ms)
 * 3. Behavior summary (300ms)
 * 4. Psychological analysis (2-5s) - opsiyonel
 * 5. Predictive timeline (2-5s) - opsiyonel
 * 6. Timeline (1-3s) - opsiyonel
 */
export const streamStudentAnalysis: RequestHandler = async (req, res) => {
  const { studentId } = req.params;
  const includeAI = req.query.includeAI === 'true';
  const userId = ((req as any)?.session?.userId) || req.ip || 'anonymous';

  try {
    // Connection limit kontrolü (DoS koruması)
    const currentConnections = activeConnections.get(userId) || 0;
    if (currentConnections >= MAX_CONCURRENT_STREAMS) {
      return res.status(429).json({
        error: 'Çok fazla eşzamanlı bağlantı. Lütfen mevcut stream\'lerin tamamlanmasını bekleyin.',
      });
    }

    // Connection sayacını artır
    activeConnections.set(userId, currentConnections + 1);

    // SSE headers ayarla
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Nginx için

    // Connection close handler
    const cleanup = () => {
      const current = activeConnections.get(userId) || 0;
      if (current > 0) {
        activeConnections.set(userId, current - 1);
      }
      if (current <= 1) {
        activeConnections.delete(userId);
      }
    };

    req.on('close', cleanup);
    res.on('finish', cleanup);

    // Helper function: Chunk gönder
    const sendChunk = (chunk: StreamChunk) => {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    };

    // 1. BASIC INFO (en hızlı - 10-50ms)
    try {
      const basicInfo = await progressiveService.getBasicInfo(studentId);
      sendChunk(progressiveService.createChunk('basic', basicInfo, 16));
    } catch (error) {
      console.error('Basic info error:', error);
      sendChunk({
        type: 'error',
        data: { message: 'Temel bilgiler alınamadı' },
        timestamp: new Date().toISOString(),
      });
    }

    // 2. ACADEMIC SUMMARY (hızlı - 50-200ms)
    try {
      const academicSummary = await progressiveService.getAcademicSummary(studentId);
      sendChunk(progressiveService.createChunk('academic', academicSummary, 33));
    } catch (error) {
      console.error('Academic summary error:', error);
      sendChunk({
        type: 'error',
        data: { message: 'Akademik özet alınamadı' },
        timestamp: new Date().toISOString(),
      });
    }

    // 3. BEHAVIOR SUMMARY (orta - 100-300ms)
    try {
      const behaviorSummary = await progressiveService.getBehaviorSummary(studentId);
      sendChunk(progressiveService.createChunk('behavior', behaviorSummary, 50));
    } catch (error) {
      console.error('Behavior summary error:', error);
      sendChunk({
        type: 'error',
        data: { message: 'Davranış özeti alınamadı' },
        timestamp: new Date().toISOString(),
      });
    }

    // AI ANALİZLERİ (opsiyonel - yavaş)
    if (includeAI) {
      // 4. PSYCHOLOGICAL ANALYSIS (yavaş - 2-5s)
      try {
        const psychological = await psychologicalService.generatePsychologicalAnalysis(studentId);
        sendChunk(progressiveService.createChunk('psychological', psychological, 70));
      } catch (error) {
        console.error('Psychological analysis error:', error);
        // AI hataları critical değil, devam et
      }

      // 5. PREDICTIVE TIMELINE (yavaş - 2-5s)
      try {
        const predictive = await predictiveService.generatePredictiveTimeline(studentId);
        sendChunk(progressiveService.createChunk('predictive', predictive, 85));
      } catch (error) {
        console.error('Predictive timeline error:', error);
        // AI hataları critical değil, devam et
      }

      // 6. TIMELINE ANALYSIS (orta-yavaş - 1-3s)
      try {
        const timeline = await timelineService.generateStudentTimeline(studentId, undefined, undefined);
        sendChunk(progressiveService.createChunk('timeline', timeline, 95));
      } catch (error) {
        console.error('Timeline analysis error:', error);
        // Hata varsa da devam et
      }
    }

    // COMPLETE SIGNAL
    sendChunk({
      type: 'complete',
      data: { completed: true },
      timestamp: new Date().toISOString(),
      progress: 100,
    });

    // Bağlantıyı kapat
    res.end();

  } catch (error) {
    console.error('Stream analysis error:', error);
    
    // Connection cleanup
    const currentConnections = activeConnections.get(userId) || 0;
    if (currentConnections > 0) {
      activeConnections.set(userId, currentConnections - 1);
    }
    
    // Genel hata durumu
    res.write(`data: ${JSON.stringify({
      type: 'error',
      data: {
        message: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
      timestamp: new Date().toISOString(),
    })}\n\n`);
    
    res.end();
  }
};

/**
 * GET /api/advanced-ai-analysis/stream/comprehensive/:studentId
 * Kapsamlı analiz için streaming endpoint
 * Tüm AI analizlerini içerir
 */
export const streamComprehensiveAnalysis: RequestHandler = async (req, res, next) => {
  // includeAI=true ile streamStudentAnalysis'i çağır
  req.query.includeAI = 'true';
  return streamStudentAnalysis(req, res, next);
};

router.get('/stream/:studentId', streamStudentAnalysis);
router.get('/stream/comprehensive/:studentId', streamComprehensiveAnalysis);

export default router;

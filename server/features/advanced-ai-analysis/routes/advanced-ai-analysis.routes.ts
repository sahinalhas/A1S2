/**
 * Advanced AI Analysis Routes
 * Gelişmiş AI Analiz API Endpoint'leri
 */

import { RequestHandler } from 'express';
import PsychologicalDepthAnalysisService from '../../../services/psychological-depth-analysis.service.js';
import PredictiveRiskTimelineService from '../../../services/predictive-risk-timeline.service.js';
import HourlyActionPlannerService from '../../../services/hourly-action-planner.service.js';
import StudentTimelineAnalyzerService from '../../../services/student-timeline-analyzer.service.js';
import ComparativeMultiStudentAnalysisService from '../../../services/comparative-multi-student-analysis.service.js';

const psychologicalService = new PsychologicalDepthAnalysisService();
const predictiveService = new PredictiveRiskTimelineService();
const actionPlannerService = new HourlyActionPlannerService();
const timelineService = new StudentTimelineAnalyzerService();
const comparativeService = new ComparativeMultiStudentAnalysisService();

/**
 * POST /api/advanced-ai-analysis/psychological/:studentId
 * Psikolojik derinlik analizi
 */
export const generatePsychologicalAnalysis: RequestHandler = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const analysis = await psychologicalService.generatePsychologicalAnalysis(studentId);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error: unknown) {
    console.error('Psychological analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Psikolojik analiz oluşturulamadı'
    });
  }
};

/**
 * POST /api/advanced-ai-analysis/predictive-timeline/:studentId
 * Öngörücü risk zaman çizelgesi
 */
export const generatePredictiveTimeline: RequestHandler = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const timeline = await predictiveService.generatePredictiveTimeline(studentId);
    
    res.json({
      success: true,
      data: timeline
    });
  } catch (error: unknown) {
    console.error('Predictive timeline error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Öngörücü zaman çizelgesi oluşturulamadı'
    });
  }
};

/**
 * POST /api/advanced-ai-analysis/daily-action-plan
 * Günlük eylem planı oluştur (forceRegenerate parametresi ile yeniden oluşturma)
 */
export const generateDailyActionPlan: RequestHandler = async (req, res) => {
  try {
    const { date, counselorName, forceRegenerate } = req.body;
    
    const plan = await actionPlannerService.generateDailyPlan(
      date || new Date().toISOString().split('T')[0],
      counselorName,
      forceRegenerate || false
    );
    
    res.json({
      success: true,
      data: plan
    });
  } catch (error: unknown) {
    console.error('Daily action plan error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Günlük eylem planı oluşturulamadı'
    });
  }
};

/**
 * POST /api/advanced-ai-analysis/student-timeline/:studentId
 * Öğrenci zaman çizelgesi analizi
 */
export const generateStudentTimeline: RequestHandler = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.body;
    
    const timeline = await timelineService.generateStudentTimeline(studentId, startDate, endDate);
    
    res.json({
      success: true,
      data: timeline
    });
  } catch (error: unknown) {
    console.error('Student timeline error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Öğrenci zaman çizelgesi oluşturulamadı'
    });
  }
};

/**
 * POST /api/advanced-ai-analysis/comparative-class/:classId
 * Sınıf karşılaştırmalı analizi
 */
export const generateClassComparison: RequestHandler = async (req, res) => {
  try {
    const { classId } = req.params;
    
    const analysis = await comparativeService.analyzeClass(classId);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error: unknown) {
    console.error('Class comparison error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Sınıf analizi oluşturulamadı'
    });
  }
};

/**
 * POST /api/advanced-ai-analysis/comparative-students
 * Çoklu öğrenci karşılaştırmalı analizi
 */
export const generateMultiStudentComparison: RequestHandler = async (req, res) => {
  try {
    const { studentIds } = req.body;
    
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'studentIds dizisi gerekli'
      });
    }
    
    const analysis = await comparativeService.analyzeMultipleStudents(studentIds);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error: unknown) {
    console.error('Multi-student comparison error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Çoklu öğrenci analizi oluşturulamadı'
    });
  }
};

/**
 * GET /api/advanced-ai-analysis/action-plan/today
 * Bugünkü eylem planını getir (cached)
 */
export const getTodayActionPlan: RequestHandler = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const plan = await actionPlannerService.generateDailyPlan(today, undefined, false);
    
    res.json({
      success: true,
      data: plan,
      cached: true
    });
  } catch (error: unknown) {
    console.error('Today action plan error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Günlük plan oluşturulamadı'
    });
  }
};

/**
 * POST /api/advanced-ai-analysis/comprehensive/:studentId
 * Kapsamlı analiz (tüm analizleri birlikte)
 */
export const generateComprehensiveAnalysis: RequestHandler = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const [psychological, predictive, timeline] = await Promise.all([
      psychologicalService.generatePsychologicalAnalysis(studentId),
      predictiveService.generatePredictiveTimeline(studentId),
      timelineService.generateStudentTimeline(studentId)
    ]);
    
    res.json({
      success: true,
      data: {
        psychological,
        predictive,
        timeline,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error: unknown) {
    console.error('Comprehensive analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Kapsamlı analiz oluşturulamadı'
    });
  }
};

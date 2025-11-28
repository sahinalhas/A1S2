/**
 * Advanced AI Analysis Feature Module
 * Gelişmiş AI Analiz Modülü
 */

import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { aiRateLimiter } from '../../middleware/rate-limit.middleware.js';
import { validateBody, validateParams } from '../../middleware/zod-validation.middleware.js';
import * as analysisHandlers from './routes/advanced-ai-analysis.routes.js';
import streamingRouter from './routes/streaming.routes.js';
import {
  StudentIdParamSchema,
  ClassIdParamSchema,
  StudentAnalysisRequestSchema,
  BulkAnalysisRequestSchema,
} from '../../../shared/validation/ai-analysis.validation.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

// Standard AI analysis endpoints - Validation BEFORE rate limiting
router.post('/psychological/:studentId', validateParams(StudentIdParamSchema), aiRateLimiter, analysisHandlers.generatePsychologicalAnalysis);
router.post('/predictive-timeline/:studentId', validateParams(StudentIdParamSchema), aiRateLimiter, analysisHandlers.generatePredictiveTimeline);
router.post('/daily-action-plan', validateBody(BulkAnalysisRequestSchema), aiRateLimiter, analysisHandlers.generateDailyActionPlan);
router.get('/action-plan/today', aiRateLimiter, analysisHandlers.getTodayActionPlan);
router.post('/student-timeline/:studentId', validateParams(StudentIdParamSchema), aiRateLimiter, analysisHandlers.generateStudentTimeline);
router.post('/comparative-class/:classId', validateParams(ClassIdParamSchema), aiRateLimiter, analysisHandlers.generateClassComparison);
router.post('/comparative-students', validateBody(BulkAnalysisRequestSchema), aiRateLimiter, analysisHandlers.generateMultiStudentComparison);
router.post('/comprehensive/:studentId', validateParams(StudentIdParamSchema), aiRateLimiter, analysisHandlers.generateComprehensiveAnalysis);

// Progressive data loading (streaming) endpoints
// Apply aiRateLimiter to streaming routes
router.use('/', aiRateLimiter, streamingRouter);

export default router;

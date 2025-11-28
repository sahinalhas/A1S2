/**
 * Student Profile AI Analysis Routes
 * API endpoints for AI-powered profile analysis and scoring
 */

import express from 'express';
import { UnifiedScoringEngine } from '../services/unified-scoring-engine.service.js';
import { AIProfileAnalyzerService } from '../services/ai-profile-analyzer.service.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const scoringEngine = new UnifiedScoringEngine();
const aiAnalyzer = new AIProfileAnalyzerService();

/**
 * GET /api/student-profile/:studentId/scores
 * Get unified scores and profile completeness for a student
 */
router.get('/:studentId/scores', async (req, res) => {
  try {
    const { studentId } = req.params;

    const [scores, completeness] = await Promise.all([
      scoringEngine.calculateUnifiedScores(studentId),
      scoringEngine.calculateProfileCompleteness(studentId)
    ]);

    res.json({
      success: true,
      data: {
        scores,
        completeness
      }
    });
  } catch (error) {
    logger.error('Error fetching student scores', 'StudentProfileAIRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate student scores'
    });
  }
});

/**
 * GET /api/student-profile/:studentId/ai-analysis
 * Get AI-powered profile analysis
 */
router.get('/:studentId/ai-analysis', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { regenerate } = req.query;

    // Get scores and completeness first
    const [scores, completeness] = await Promise.all([
      scoringEngine.calculateUnifiedScores(studentId),
      scoringEngine.calculateProfileCompleteness(studentId)
    ]);

    // Generate AI analysis
    const analysis = await aiAnalyzer.analyzeProfile(
      scores,
      completeness
    );

    res.json({
      success: true,
      data: {
        analysis,
        scores,
        completeness
      }
    });
  } catch (error) {
    logger.error('Error generating AI analysis', 'StudentProfileAIRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI analysis'
    });
  }
});

/**
 * POST /api/student-profile/:studentId/recalculate-scores
 * Force recalculation of all scores
 */
router.post('/:studentId/recalculate-scores', async (req, res) => {
  try {
    const { studentId } = req.params;

    const scores = await scoringEngine.calculateUnifiedScores(studentId);
    await scoringEngine.saveAggregateScores(studentId, scores);

    res.json({
      success: true,
      message: 'Scores recalculated successfully',
      data: { scores }
    });
  } catch (error) {
    logger.error('Error recalculating scores', 'StudentProfileAIRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to recalculate scores'
    });
  }
});

export default router;

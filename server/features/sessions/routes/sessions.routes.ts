import { RequestHandler } from 'express';
import * as sessionsService from '../services/sessions.service.js';
import { logger } from '../../../utils/logger.js';
import type { StudentIdParam, SessionInput } from '../../../../shared/validation/sessions.validation.js';

export const getStudySessions: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params as StudentIdParam;
    const sessions = sessionsService.getStudentSessions(studentId);
    res.json(sessions);
  } catch (error) {
    logger.error('Error getting study sessions', 'SessionsRoutes', error);
    res.status(500).json({ error: 'Failed to get study sessions' });
  }
};

export const saveStudySession: RequestHandler = (req, res) => {
  try {
    const sessionInput = req.body as SessionInput;
    const result = sessionsService.createStudySession(sessionInput);
    res.json(result);
  } catch (error) {
    logger.error('Error saving study session', 'SessionsRoutes', error);
    res.status(500).json({ error: 'Failed to save study session' });
  }
};

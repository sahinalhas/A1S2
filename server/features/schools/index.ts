import { Router } from 'express';
import { requireSecureAuth, AuthenticatedRequest } from '../../middleware/auth-secure.middleware.js';
import * as schoolsRoutes from './routes/schools.routes.js';

const router = Router();

router.get('/my-schools', requireSecureAuth, schoolsRoutes.getMySchools);
router.get('/', requireSecureAuth, schoolsRoutes.getAllSchools);
router.get('/:schoolId', requireSecureAuth, schoolsRoutes.getSchoolById);
router.post('/', requireSecureAuth, schoolsRoutes.createSchool);

export default router;

import { Router } from 'express';
import { AdvancedAnalyticsDashboardService } from '../../../services/advanced-analytics-dashboard.service';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

const router = Router();
router.use(validateSchoolAccess);
const dashboardService = new AdvancedAnalyticsDashboardService();

router.get('/dashboard/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const overview = await dashboardService.generateDashboardOverview(studentId);
    
    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      error: (error instanceof Error ? error.message : String(error)) || 'Dashboard oluşturulamadı'
    });
  }
});

router.post('/generate-report', async (req, res) => {
  try {
    const { studentId, reportType } = req.body;
    
    if (!studentId || !reportType) {
      return res.status(400).json({
        success: false,
        error: 'studentId ve reportType gereklidir'
      });
    }

    const report = await dashboardService.generateAIReport(studentId, reportType);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;

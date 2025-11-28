import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';
/**
 * Auto Reports Routes
 */

import { Router } from 'express';
import { AutoReportGeneratorService } from '../services/auto-report-generator.service.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

const router = Router();
router.use(validateSchoolAccess);
const reportService = new AutoReportGeneratorService();

/**
 * POST /api/reports/progress/:studentId
 * Dönemsel gelişim raporu oluştur
 */
router.post('/progress/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { reportType, reportPeriod } = req.body;

    const report = await reportService.generateProgressReport(
      studentId,
      reportType || 'quarterly',
      reportPeriod || 'Dönem 1'
    );

    res.json({
      success: true,
      data: report
    });
  } catch (error: unknown) {
    console.error('Progress report error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Gelişim raporu oluşturulamadı'
    });
  }
});

/**
 * POST /api/reports/ram/:studentId
 * RAM sevk raporu oluştur
 */
router.post('/ram/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { referralReason } = req.body;

    if (!referralReason) {
      return res.status(400).json({
        success: false,
        error: 'Sevk nedeni gerekli'
      });
    }

    const report = await reportService.generateRAMReport(studentId, referralReason);

    res.json({
      success: true,
      data: report
    });
  } catch (error: unknown) {
    console.error('RAM report error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'RAM raporu oluşturulamadı'
    });
  }
});

/**
 * POST /api/reports/bep/:studentId
 * BEP raporu oluştur
 */
router.post('/bep/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { diagnosis } = req.body;

    const report = await reportService.generateBEPReport(studentId, diagnosis);

    res.json({
      success: true,
      data: report
    });
  } catch (error: unknown) {
    console.error('BEP report error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'BEP raporu oluşturulamadı'
    });
  }
});

/**
 * POST /api/reports/bulk
 * Toplu rapor oluştur
 */
router.post('/bulk', async (req, res) => {
  try {
    const { studentIds, reportType } = req.body;

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({
        success: false,
        error: 'Öğrenci ID listesi gerekli'
      });
    }

    const reports = await reportService.generateBulkReports(
      studentIds,
      reportType || 'summary'
    );

    res.json({
      success: true,
      data: reports
    });
  } catch (error: unknown) {
    console.error('Bulk report error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Toplu rapor oluşturulamadı'
    });
  }
});

export default router;

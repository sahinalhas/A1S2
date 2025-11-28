import { Request, Response } from 'express';
import * as service from '../services/early-warning.service.js';

export async function analyzeStudentRisk(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    const result = await service.analyzeStudentRisk(studentId);
    res.json(result);
  } catch (error) {
    console.error('Error analyzing student risk:', error);
    res.status(500).json({ 
      success: false,
      error: 'Risk analizi yapılırken bir hata oluştu' 
    });
  }
}

export function getRiskScoreHistory(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    const history = service.getRiskScoreHistory(studentId);
    res.json(history);
  } catch (error) {
    console.error('Error getting risk score history:', error);
    res.status(500).json({ 
      success: false,
      error: 'Risk geçmişi alınırken bir hata oluştu' 
    });
  }
}

export function getLatestRiskScore(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    const score = service.getLatestRiskScore(studentId);
    res.json(score);
  } catch (error) {
    console.error('Error getting latest risk score:', error);
    res.status(500).json({ 
      success: false,
      error: 'Son risk skoru alınırken bir hata oluştu' 
    });
  }
}

export function getAllAlerts(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    const alerts = service.getAllAlertsBySchool(schoolId);
    res.json(alerts);
  } catch (error) {
    console.error('Error getting all alerts:', error);
    res.status(500).json({ 
      success: false,
      error: 'Uyarılar alınırken bir hata oluştu' 
    });
  }
}

export function getAlertsByStudent(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    const alerts = service.getAlertsByStudent(studentId);
    res.json(alerts);
  } catch (error) {
    console.error('Error getting alerts by student:', error);
    res.status(500).json({ 
      success: false,
      error: 'Öğrenci uyarıları alınırken bir hata oluştu' 
    });
  }
}

export function getActiveAlerts(req: Request, res: Response) {
  try {
    const schoolId = (req as any).schoolId;
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    const alerts = service.getActiveAlertsBySchool(schoolId);
    res.json(alerts);
  } catch (error) {
    console.error('Error getting active alerts:', error);
    res.status(500).json({ 
      success: false,
      error: 'Aktif uyarılar alınırken bir hata oluştu' 
    });
  }
}

export function getAlertById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const alert = service.getAlertById(id);
    res.json(alert);
  } catch (error) {
    console.error('Error getting alert by id:', error);
    res.status(500).json({ 
      success: false,
      error: 'Uyarı alınırken bir hata oluştu' 
    });
  }
}

export function updateAlertStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = service.updateAlertStatus(id, status);
    res.json(result);
  } catch (error) {
    console.error('Error updating alert status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Uyarı durumu güncellenirken bir hata oluştu' 
    });
  }
}

export function updateAlert(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = service.updateAlert(id, updates);
    res.json(result);
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ 
      success: false,
      error: 'Uyarı güncellenirken bir hata oluştu' 
    });
  }
}

export function deleteAlert(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = service.deleteAlert(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ 
      success: false,
      error: 'Uyarı silinirken bir hata oluştu' 
    });
  }
}

export function getRecommendationsByStudent(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    const recommendations = service.getRecommendationsByStudent(studentId);
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations by student:', error);
    res.status(500).json({ 
      success: false,
      error: 'Öğrenci önerileri alınırken bir hata oluştu' 
    });
  }
}

export function getRecommendationsByAlert(req: Request, res: Response) {
  try {
    const { alertId } = req.params;
    const recommendations = service.getRecommendationsByAlert(alertId);
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations by alert:', error);
    res.status(500).json({ 
      success: false,
      error: 'Uyarı önerileri alınırken bir hata oluştu' 
    });
  }
}

export function getActiveRecommendations(req: Request, res: Response) {
  try {
    const recommendations = service.getActiveRecommendations();
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting active recommendations:', error);
    res.status(500).json({ 
      success: false,
      error: 'Aktif öneriler alınırken bir hata oluştu' 
    });
  }
}

export function updateRecommendationStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = service.updateRecommendationStatus(id, status);
    res.json(result);
  } catch (error) {
    console.error('Error updating recommendation status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Öneri durumu güncellenirken bir hata oluştu' 
    });
  }
}

export function updateRecommendation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = service.updateRecommendation(id, updates);
    res.json(result);
  } catch (error) {
    console.error('Error updating recommendation:', error);
    res.status(500).json({ 
      success: false,
      error: 'Öneri güncellenirken bir hata oluştu' 
    });
  }
}

export function deleteRecommendation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = service.deleteRecommendation(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    res.status(500).json({ 
      success: false,
      error: 'Öneri silinirken bir hata oluştu' 
    });
  }
}

export function getHighRiskStudents(req: Request, res: Response) {
  try {
    const students = service.getHighRiskStudents();
    res.json(students);
  } catch (error) {
    console.error('Error getting high risk students:', error);
    res.status(500).json({ 
      success: false,
      error: 'Yüksek riskli öğrenciler alınırken bir hata oluştu' 
    });
  }
}

export function getDashboardSummary(req: Request, res: Response) {
  try {
    const summary = service.getDashboardSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({ 
      success: false,
      error: 'Özet bilgiler alınırken bir hata oluştu' 
    });
  }
}

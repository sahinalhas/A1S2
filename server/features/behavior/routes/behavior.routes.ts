import { Router } from 'express';
import * as service from '../services/behavior.service.js';
import { autoSyncHooks } from '../../profile-sync/services/auto-sync-hooks.service.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';

const router = Router();
router.use(validateSchoolAccess);

router.get('/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const incidents = service.getBehaviorIncidentsByStudent(studentId);
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching behavior incidents:', error);
    res.status(500).json({ error: 'Davranış kayıtları yüklenirken hata oluştu' });
  }
});

router.get('/:studentId/stats', (req, res) => {
  try {
    const { studentId } = req.params;
    const stats = service.getBehaviorStatsByStudent(studentId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching behavior stats:', error);
    res.status(500).json({ error: 'Davranış istatistikleri yüklenirken hata oluştu' });
  }
});

router.post('/', (req, res) => {
  try {
    const incident = req.body;
    const result = service.addBehaviorIncident(incident);
    
    // 🔥 OTOMATIK PROFİL SENKRONIZASYONU - Davranış kaydı eklendiğinde profili güncelle
    if (result.success && incident.studentId && incident.id) {
      autoSyncHooks.onBehaviorIncidentRecorded({
        id: incident.id,
        studentId: incident.studentId,
        behaviorType: incident.behaviorType,
        description: incident.behaviorDescription || incident.description,
        severity: incident.severity,
        date: incident.date,
        ...incident
      }).catch(error => {
        console.error('Profile sync failed after behavior incident:', error);
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error adding behavior incident:', error);
    res.status(500).json({ error: 'Davranış kaydı eklenirken hata oluştu' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = service.updateBehaviorIncident(id, updates);
    res.json(result);
  } catch (error) {
    console.error('Error updating behavior incident:', error);
    res.status(500).json({ error: 'Davranış kaydı güncellenirken hata oluştu' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = service.deleteBehaviorIncident(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting behavior incident:', error);
    res.status(500).json({ error: 'Davranış kaydı silinirken hata oluştu' });
  }
});

export default router;

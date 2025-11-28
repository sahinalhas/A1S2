import { Request, Response } from 'express';
import * as service from '../services/outcomes.service.js';

export function getAllOutcomes(req: Request, res: Response) {
  try {
    const outcomes = service.getAllOutcomes();
    res.json(outcomes);
  } catch (error) {
    console.error('Error fetching outcomes:', error);
    res.status(500).json({ error: 'Sonuçlar yüklenemedi' });
  }
}

export function getOutcomesRequiringFollowUp(req: Request, res: Response) {
  try {
    const outcomes = service.getOutcomesRequiringFollowUp();
    res.json(outcomes);
  } catch (error) {
    console.error('Error fetching outcomes requiring follow-up:', error);
    res.status(500).json({ error: 'Takip gerektiren sonuçlar yüklenemedi' });
  }
}

export function getOutcomeById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const outcome = service.getOutcomeById(id);
    
    if (!outcome) {
      return res.status(404).json({ error: 'Sonuç bulunamadı' });
    }
    
    res.json(outcome);
  } catch (error) {
    console.error('Error fetching outcome:', error);
    res.status(500).json({ error: 'Sonuç yüklenemedi' });
  }
}

export function getOutcomeBySessionId(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    const outcome = service.getOutcomeBySessionId(sessionId);
    
    if (!outcome) {
      return res.status(404).json({ error: 'Bu görüşme için sonuç bulunamadı' });
    }
    
    res.json(outcome);
  } catch (error) {
    console.error('Error fetching outcome by session:', error);
    res.status(500).json({ error: 'Görüşme sonucu yüklenemedi' });
  }
}

export function createOutcome(req: Request, res: Response) {
  try {
    const { id, sessionId } = req.body;
    
    if (!id || !sessionId) {
      return res.status(400).json({ error: 'ID ve görüşme ID zorunludur' });
    }
    
    const result = service.createOutcome(req.body);
    res.json(result);
  } catch (error: unknown) {
    console.error('Error creating outcome:', error);
    if (error instanceof Error ? error.message : String(error)?.includes('Etkinlik puanı')) {
      return res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
    res.status(500).json({ error: 'Sonuç kaydedilemedi' });
  }
}

export function updateOutcome(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = service.updateOutcome(id, req.body);
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Sonuç bulunamadı' });
    }
    
    res.json({ success: true });
  } catch (error: unknown) {
    console.error('Error updating outcome:', error);
    if (error instanceof Error ? error.message : String(error)?.includes('Etkinlik puanı')) {
      return res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
    res.status(500).json({ error: 'Sonuç güncellenemedi' });
  }
}

export function deleteOutcome(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = service.deleteOutcome(id);
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Sonuç bulunamadı' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting outcome:', error);
    res.status(500).json({ error: 'Sonuç silinemedi' });
  }
}

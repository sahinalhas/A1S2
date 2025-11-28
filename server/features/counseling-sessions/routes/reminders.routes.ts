import { Request, Response } from 'express';
import * as service from '../services/reminders.service.js';

export function getAllReminders(req: Request, res: Response) {
  try {
    const reminders = service.getAllReminders();
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Hatırlatıcılar yüklenemedi' });
  }
}

export function getReminderById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const reminder = service.getReminderById(id);
    
    if (!reminder) {
      return res.status(404).json({ error: 'Hatırlatıcı bulunamadı' });
    }
    
    res.json(reminder);
  } catch (error) {
    console.error('Error fetching reminder:', error);
    res.status(500).json({ error: 'Hatırlatıcı yüklenemedi' });
  }
}

export function getRemindersBySessionId(req: Request, res: Response) {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Session ID gereklidir' });
    }
    
    const reminders = service.getRemindersBySessionId(sessionId);
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders by session:', error);
    res.status(500).json({ error: 'Hatırlatıcılar yüklenemedi' });
  }
}

export function getRemindersByStatus(req: Request, res: Response) {
  try {
    const { status } = req.query;
    
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'Status gereklidir' });
    }
    
    const reminders = service.getRemindersByStatus(status);
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders by status:', error);
    res.status(500).json({ error: 'Hatırlatıcılar yüklenemedi' });
  }
}

export function getPendingReminders(req: Request, res: Response) {
  try {
    const reminders = service.getPendingReminders();
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching pending reminders:', error);
    res.status(500).json({ error: 'Bekleyen hatırlatıcılar yüklenemedi' });
  }
}

export function createReminder(req: Request, res: Response) {
  try {
    const { id, reminderType, reminderDate, reminderTime, title } = req.body;
    
    if (!id || !reminderType || !reminderDate || !reminderTime || !title) {
      return res.status(400).json({ error: 'Zorunlu alanlar eksik' });
    }
    
    const result = service.createReminder(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Hatırlatıcı oluşturulamadı' });
  }
}

export function updateReminder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const result = service.updateReminder(id, req.body);
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Hatırlatıcı bulunamadı' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ error: 'Hatırlatıcı güncellenemedi' });
  }
}

export function updateReminderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status gereklidir' });
    }
    
    const result = service.updateReminderStatus(id, status);
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Hatırlatıcı bulunamadı' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating reminder status:', error);
    res.status(500).json({ error: 'Hatırlatıcı durumu güncellenemedi' });
  }
}

export function deleteReminder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = service.deleteReminder(id);
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Hatırlatıcı bulunamadı' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: 'Hatırlatıcı silinemedi' });
  }
}

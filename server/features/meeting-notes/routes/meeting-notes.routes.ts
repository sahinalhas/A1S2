import { RequestHandler } from 'express';
import * as meetingNotesService from '../services/meeting-notes.service.js';

export const getMeetingNotes: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId || typeof studentId !== 'string' || studentId.length > 50) {
      return res.status(400).json({ 
        success: false, 
        error: "Geçersiz öğrenci ID" 
      });
    }
    
    const notes = meetingNotesService.getStudentMeetingNotes(studentId);
    res.json(notes);
  } catch (error) {
    console.error('Error fetching meeting notes:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ success: false, error: 'Görüşme notları getirilirken hata oluştu' });
  }
};

export const saveMeetingNoteHandler: RequestHandler = (req, res) => {
  try {
    const note = req.body;
    
    meetingNotesService.createMeetingNote(note);
    
    res.json({ success: true, message: 'Görüşme notu kaydedildi' });
  } catch (error) {
    console.error('Error saving meeting note:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz") || errorMessage.includes("Zorunlu") || errorMessage.includes("eksik")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: `Görüşme notu kaydedilemedi: ${errorMessage}` 
    });
  }
};

export const updateMeetingNoteHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const note = req.body;
    
    if (!id || typeof id !== 'string' || id.length > 50) {
      return res.status(400).json({ 
        success: false, 
        error: "Geçersiz not ID" 
      });
    }
    
    meetingNotesService.modifyMeetingNote(id, note);
    
    res.json({ success: true, message: 'Görüşme notu güncellendi' });
  } catch (error) {
    console.error('Error updating meeting note:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz") || errorMessage.includes("zorunludur")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: `Görüşme notu güncellenemedi: ${errorMessage}` 
    });
  }
};

export const deleteMeetingNoteHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string' || id.length > 50) {
      return res.status(400).json({ 
        success: false, 
        error: "Geçersiz not ID" 
      });
    }
    
    meetingNotesService.removeMeetingNote(id);
    
    res.json({ success: true, message: 'Görüşme notu silindi' });
  } catch (error) {
    console.error('Error deleting meeting note:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ success: false, error: 'Görüşme notu silinemedi' });
  }
};

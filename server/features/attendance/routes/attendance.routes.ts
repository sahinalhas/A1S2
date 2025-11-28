import { RequestHandler } from 'express';
import * as attendanceService from '../services/attendance.service.js';
import { randomUUID } from 'crypto';

export const getAttendanceByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId || typeof studentId !== 'string' || studentId.length > 50) {
      return res.status(400).json({ 
        success: false, 
        error: "Geçersiz öğrenci ID" 
      });
    }
    
    const attendance = attendanceService.getStudentAttendance(studentId);
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ success: false, error: 'Devam kayıtları getirilirken hata oluştu' });
  }
};

export const getAllAttendance: RequestHandler = (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Error fetching all attendance:', error);
    res.status(500).json({ success: false, error: 'Devam kayıtları getirilirken hata oluştu' });
  }
};

export const saveAttendance: RequestHandler = (req, res) => {
  try {
    const attendance = req.body;
    
    if (!attendance.id) {
      attendance.id = randomUUID();
    }
    
    attendanceService.createAttendance(attendance, attendance.id);
    
    res.json({ success: true, message: 'Devam kaydı başarıyla eklendi' });
  } catch (error) {
    console.error('Error saving attendance:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz") || errorMessage.includes("gereklidir")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: `Devam kaydı eklenemedi: ${errorMessage}` 
    });
  }
};

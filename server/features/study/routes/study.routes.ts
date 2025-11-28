import { RequestHandler } from "express";
import { randomUUID } from 'crypto';
import * as studyService from '../services/study.service.js';

export const getStudyAssignments: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const assignments = studyService.getStudentAssignments(studentId);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching study assignments:', error);
    const errorMessage = error instanceof Error ? error.message : 'Çalışma ödevleri getirilirken hata oluştu';
    res.status((error instanceof Error ? error.message : String(error)).includes('Geçersiz') ? 400 : 500)
      .json({ success: false, error: errorMessage });
  }
};

export const saveStudyAssignmentHandler: RequestHandler = (req, res) => {
  try {
    const assignment = req.body;
    const generatedId = randomUUID();
    
    studyService.createStudyAssignment(assignment, generatedId);
    
    res.json({ success: true, message: 'Çalışma ödevi kaydedildi' });
  } catch (error) {
    console.error('Error saving study assignment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Çalışma ödevi kaydedilemedi';
    res.status((error instanceof Error ? error.message : String(error)).includes('Geçersiz') ? 400 : 500)
      .json({ success: false, error: errorMessage });
  }
};

export const updateStudyAssignmentHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    studyService.updateAssignment(id, status, notes);
    res.json({ success: true, message: 'Çalışma ödevi güncellendi' });
  } catch (error) {
    console.error('Error updating study assignment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Çalışma ödevi güncellenemedi';
    res.status((error instanceof Error ? error.message : String(error)).includes('Geçersiz') ? 400 : 500)
      .json({ success: false, error: errorMessage });
  }
};

export const deleteStudyAssignmentHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    studyService.deleteAssignment(id);
    res.json({ success: true, message: 'Çalışma ödevi silindi' });
  } catch (error) {
    console.error('Error deleting study assignment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Çalışma ödevi silinemedi';
    res.status((error instanceof Error ? error.message : String(error)).includes('Geçersiz') ? 400 : 500)
      .json({ success: false, error: errorMessage });
  }
};

export const getAllWeeklySlotsHandler: RequestHandler = (req, res) => {
  try {
    const slots = studyService.getAllSlots();
    res.json(slots);
  } catch (error) {
    console.error('Error fetching all weekly slots:', error);
    res.status(500).json({ success: false, error: 'Haftalık program getirilirken hata oluştu' });
  }
};

export const getWeeklySlots: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const slots = studyService.getStudentSlots(studentId);
    res.json(slots);
  } catch (error) {
    console.error('Error fetching weekly slots:', error);
    const errorMessage = error instanceof Error ? error.message : 'Haftalık program getirilirken hata oluştu';
    res.status((error instanceof Error ? error.message : String(error)).includes('Geçersiz') ? 400 : 500)
      .json({ success: false, error: errorMessage });
  }
};

export const saveWeeklySlotHandler: RequestHandler = (req, res) => {
  try {
    const data = req.body;
    const generatedId = randomUUID();
    
    studyService.createWeeklySlots(data, generatedId);
    
    res.json({ success: true, message: 'Haftalık program kaydedildi' });
  } catch (error) {
    console.error('Error saving weekly slot:', error);
    const errorMessage = error instanceof Error ? error.message : 'Haftalık program kaydedilemedi';
    res.status((error instanceof Error ? error.message : String(error)).includes('Geçersiz') ? 400 : 500)
      .json({ success: false, error: errorMessage });
  }
};

export const updateWeeklySlotHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    
    studyService.updateSlot(id, body);
    res.json({ success: true, message: 'Haftalık program güncellendi' });
  } catch (error) {
    console.error('Error updating weekly slot:', error);
    const errorMessage = error instanceof Error ? error.message : 'Haftalık program güncellenemedi';
    res.status((error instanceof Error ? error.message : String(error)).includes('Geçersiz') ? 400 : 500)
      .json({ success: false, error: errorMessage });
  }
};

export const deleteWeeklySlotHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    studyService.deleteSlot(id);
    res.json({ success: true, message: 'Haftalık program silindi' });
  } catch (error) {
    console.error('Error deleting weekly slot:', error);
    const errorMessage = error instanceof Error ? error.message : 'Haftalık program silinemedi';
    res.status((error instanceof Error ? error.message : String(error)).includes('Geçersiz') ? 400 : 500)
      .json({ success: false, error: errorMessage });
  }
};

export const savePlannedTopicsHandler: RequestHandler = (req, res) => {
  try {
    const { studentId, weekStartDate } = req.params;
    const plannedTopics = req.body;
    
    studyService.savePlannedTopics(plannedTopics, studentId, weekStartDate);
    res.json({ success: true, message: 'Konu bazlı plan kaydedildi' });
  } catch (error) {
    console.error('Error saving planned topics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Konu bazlı plan kaydedilemedi';
    res.status(400).json({ success: false, error: errorMessage });
  }
};

export const getPlannedTopicsHandler: RequestHandler = (req, res) => {
  try {
    const { studentId, weekStartDate } = req.params;
    
    const topics = studyService.getPlannedTopics(studentId, weekStartDate);
    res.json(topics);
  } catch (error) {
    console.error('Error getting planned topics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Konu bazlı plan getirilirken hata oluştu';
    res.status(400).json({ success: false, error: errorMessage });
  }
};

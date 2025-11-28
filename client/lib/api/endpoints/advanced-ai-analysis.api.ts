/**
 * Advanced AI Analysis API Client
 * Gelişmiş AI Analiz API İstemcisi
 */

import type {
 PsychologicalDepthAnalysis,
 PredictiveRiskTimeline,
 CounselorDailyPlan,
 StudentTimeline,
 ComparativeAnalysisReport
} from '@shared/types/advanced-ai-analysis.types';
import { apiClient } from '../core/client';
import { ADVANCED_AI_ENDPOINTS } from '../../constants/api-endpoints';

export interface ComprehensiveAnalysisResponse {
 psychological: PsychologicalDepthAnalysis;
 predictive: PredictiveRiskTimeline;
 timeline: StudentTimeline;
 generatedAt: string;
}

interface ApiResponse<T> {
 data: T;
}

export async function generatePsychologicalAnalysis(studentId: string): Promise<PsychologicalDepthAnalysis> {
 const response = await apiClient.post<ApiResponse<PsychologicalDepthAnalysis>>(
 ADVANCED_AI_ENDPOINTS.PSYCHOLOGICAL(studentId),
 undefined,
 {
 showSuccessToast: true,
 successMessage: 'Psikolojik analiz oluşturuldu',
 errorMessage: 'Psikolojik analiz oluşturulamadı',
 }
 );
 return response.data;
}

export async function generatePredictiveTimeline(studentId: string): Promise<PredictiveRiskTimeline> {
 const response = await apiClient.post<ApiResponse<PredictiveRiskTimeline>>(
 ADVANCED_AI_ENDPOINTS.PREDICTIVE_TIMELINE(studentId),
 undefined,
 {
 showSuccessToast: true,
 successMessage: 'Öngörücü zaman çizelgesi oluşturuldu',
 errorMessage: 'Öngörücü zaman çizelgesi oluşturulamadı',
 }
 );
 return response.data;
}

export async function generateDailyActionPlan(
 date?: string,
 counselorName?: string,
 forceRegenerate?: boolean
): Promise<CounselorDailyPlan> {
 const response = await apiClient.post<ApiResponse<CounselorDailyPlan>>(
 ADVANCED_AI_ENDPOINTS.DAILY_ACTION_PLAN,
 {
 date: date || new Date().toISOString().split('T')[0],
 counselorName,
 forceRegenerate: forceRegenerate || false
 },
 {
 showSuccessToast: true,
 successMessage: 'Günlük eylem planı oluşturuldu',
 errorMessage: 'Günlük eylem planı oluşturulamadı',
 }
 );
 return response.data;
}

export async function getTodayActionPlan(): Promise<CounselorDailyPlan> {
 const response = await apiClient.get<ApiResponse<CounselorDailyPlan>>(
 ADVANCED_AI_ENDPOINTS.DAILY_ACTION_PLAN,
 {
 errorMessage: 'Günlük plan alınamadı',
 }
 );
 return response.data;
}

export async function generateStudentTimeline(
 studentId: string,
 startDate?: string,
 endDate?: string
): Promise<StudentTimeline> {
 const response = await apiClient.post<ApiResponse<StudentTimeline>>(
 ADVANCED_AI_ENDPOINTS.STUDENT_TIMELINE(studentId),
 { startDate, endDate },
 {
 showSuccessToast: true,
 successMessage: 'Öğrenci zaman çizelgesi oluşturuldu',
 errorMessage: 'Öğrenci zaman çizelgesi oluşturulamadı',
 }
 );
 return response.data;
}

export async function generateClassComparison(classId: string): Promise<ComparativeAnalysisReport> {
 const response = await apiClient.post<ApiResponse<ComparativeAnalysisReport>>(
 ADVANCED_AI_ENDPOINTS.COMPARATIVE_CLASS(classId),
 undefined,
 {
 showSuccessToast: true,
 successMessage: 'Sınıf analizi oluşturuldu',
 errorMessage: 'Sınıf analizi oluşturulamadı',
 }
 );
 return response.data;
}

export async function generateMultiStudentComparison(
 studentIds: string[]
): Promise<ComparativeAnalysisReport> {
 const response = await apiClient.post<ApiResponse<ComparativeAnalysisReport>>(
 ADVANCED_AI_ENDPOINTS.COMPARATIVE_STUDENTS,
 { studentIds },
 {
 showSuccessToast: true,
 successMessage: 'Çoklu öğrenci analizi oluşturuldu',
 errorMessage: 'Çoklu öğrenci analizi oluşturulamadı',
 }
 );
 return response.data;
}

export async function generateComprehensiveAnalysis(
 studentId: string
): Promise<ComprehensiveAnalysisResponse> {
 const response = await apiClient.post<ApiResponse<ComprehensiveAnalysisResponse>>(
 ADVANCED_AI_ENDPOINTS.COMPREHENSIVE(studentId),
 undefined,
 {
 showSuccessToast: true,
 successMessage: 'Kapsamlı analiz oluşturuldu',
 errorMessage: 'Kapsamlı analiz oluşturulamadı',
 }
 );
 return response.data;
}

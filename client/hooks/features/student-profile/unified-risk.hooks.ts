/**
 * Unified Risk Profile Hook
 * Tüm risk bilgilerini tek bir yerden sağlar
 * - Manual risk (Genel Bilgiler'den)
 * - Risk factors (Risk değerlendirmeden)
 * - Enhanced risk (AI tabanlı)
 * - Risk & Protective profile
 */

import { useQuery } from "@tanstack/react-query";
import { Student } from "@/lib/storage";
import { apiClient } from "@/lib/api/core/client";

export interface UnifiedRiskData {
 // Manuel risk (Genel Bilgiler'den)
 manualRisk:"Düşük" |"Orta" |"Yüksek" | null;
 
 // Risk faktörleri değerlendirmesi
 riskFactors: {
 assessmentDate: string;
 academicRiskLevel: string;
 behavioralRiskLevel: string;
 attendanceRiskLevel: string;
 socialEmotionalRiskLevel: string;
 academicFactors?: string;
 behavioralFactors?: string;
 protectiveFactors?: string;
 interventionsNeeded?: string;
 } | null;
 
 // AI tabanlı enhanced risk
 enhancedRisk: {
 overallScore: number;
 category: string;
 trend:"increasing" |"stable" |"decreasing";
 factors: Array<{
 factor: string;
 impact:"high" |"medium" |"low";
 description: string;
 }>;
 } | null;
 
 // Risk & Protective Profile
 riskProtectiveProfile: {
 riskScore: number;
 protectiveScore: number;
 recommendations: string[];
 } | null;
 
 // Birleştirilmiş risk skoru (0-100)
 unifiedRiskScore: number;
 
 // Risk kategorisi
 riskCategory:"low" |"medium" |"high" |"critical";
 
 // Öncelik durumu
 interventionPriority:"low" |"medium" |"high" |"critical";
}

export function useUnifiedRisk(studentId: string, student?: Student) {
 return useQuery<UnifiedRiskData>({
 queryKey: ['unified-risk', studentId],
 queryFn: async () => {
 // Manuel risk bilgisini al ve validate et
 const manualRisk = validateManualRisk(student?.risk);
 
 // Risk faktörlerini al (API'den)
 let riskFactors = null;
 try {
 const response = await apiClient.get(`/api/risk-assessment/${studentId}`);
 riskFactors = validateRiskFactors(response);
 } catch (error) {
 console.error('Risk factors fetch error:', error);
 }
 
 // Enhanced risk'i al (AI tabanlı)
 let enhancedRisk = null;
 try {
 const response = await apiClient.get(`/api/enhanced-risk/${studentId}`);
 enhancedRisk = validateEnhancedRisk(response);
 } catch (error) {
 console.error('Enhanced risk fetch error:', error);
 }
 
 // Risk & Protective profile'ı al
 let riskProtectiveProfile = null;
 try {
 const response = await apiClient.get(`/api/student-profile/${studentId}/risk-protective`);
 riskProtectiveProfile = validateRiskProtectiveProfile(response);
 } catch (error) {
 console.error('Risk protective profile fetch error:', error);
 }
 
 // Birleştirilmiş risk skorunu hesapla
 const unifiedRiskScore = calculateUnifiedRiskScore({
 manualRisk,
 riskFactors,
 enhancedRisk,
 riskProtectiveProfile
 });
 
 // Risk kategorisini belirle
 const riskCategory = getRiskCategory(unifiedRiskScore);
 
 // Müdahale önceliğini belirle
 const interventionPriority = getInterventionPriority(
 unifiedRiskScore,
 riskFactors,
 enhancedRisk
 );
 
 return {
 manualRisk,
 riskFactors,
 enhancedRisk,
 riskProtectiveProfile,
 unifiedRiskScore,
 riskCategory,
 interventionPriority,
 };
 },
 staleTime: 5 * 60 * 1000, // 5 dakika
 enabled: !!studentId,
 });
}

// Birleştirilmiş risk skorunu hesapla
function calculateUnifiedRiskScore(data: {
 manualRisk: string | null;
 riskFactors: any;
 enhancedRisk: any;
 riskProtectiveProfile: any;
}): number {
 const scores: number[] = [];
 
 // Manuel risk'i skora çevir
 if (data.manualRisk) {
 const manualScore = {
"Düşük": 20,
"Orta": 50,
"Yüksek": 80
 }[data.manualRisk] || 0;
 scores.push(manualScore);
 }
 
 // Risk faktörlerinden skor hesapla
 if (data.riskFactors) {
 // Case-insensitive level mapping
 const getLevelScore = (level: string): number => {
 const normalized = level.toUpperCase().replace(/\s+/g, '_');
 const scoreMap: Record<string, number> = {
"DÜŞÜK": 20,
"ORTA": 50,
"YÜKSEK": 75,
"ÇOK_YÜKSEK": 95
 };
 return scoreMap[normalized] || 0;
 };
 
 const factorScores = [
 getLevelScore(data.riskFactors.academicRiskLevel),
 getLevelScore(data.riskFactors.behavioralRiskLevel),
 getLevelScore(data.riskFactors.attendanceRiskLevel),
 getLevelScore(data.riskFactors.socialEmotionalRiskLevel),
 ];
 
 const avgFactorScore = factorScores.reduce((a, b) => a + b, 0) / factorScores.length;
 scores.push(avgFactorScore);
 }
 
 // Enhanced risk skorunu ekle
 if (data.enhancedRisk?.overallScore) {
 scores.push(data.enhancedRisk.overallScore);
 }
 
 // Risk protective profile'dan risk skorunu ekle
 if (data.riskProtectiveProfile?.riskScore) {
 scores.push(data.riskProtectiveProfile.riskScore);
 }
 
 // Ortalama hesapla
 if (scores.length === 0) return 0;
 
 return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// Risk kategorisini belirle
function getRiskCategory(score: number):"low" |"medium" |"high" |"critical" {
 if (score >= 80) return"critical";
 if (score >= 60) return"high";
 if (score >= 35) return"medium";
 return"low";
}

// Müdahale önceliğini belirle
function getInterventionPriority(
 score: number,
 riskFactors: any,
 enhancedRisk: any
):"low" |"medium" |"high" |"critical" {
 // Case-insensitive comparison helper
 const isLevel = (value: string, target: string) => {
 return value?.toUpperCase().replace(/\s+/g, '_') === target;
 };
 
 // Çok yüksek risk faktörleri varsa kritik
 if (isLevel(riskFactors?.behavioralRiskLevel,"ÇOK_YÜKSEK") ||
 isLevel(riskFactors?.academicRiskLevel,"ÇOK_YÜKSEK")) {
 return"critical";
 }
 
 // Enhanced risk trend'i artıyorsa öncelik yükselir
 if (enhancedRisk?.trend ==="increasing" && score >= 50) {
 return score >= 70 ?"critical" :"high";
 }
 
 // Normal kategori
 return getRiskCategory(score);
}

// Veri Validasyon Fonksiyonları

function validateManualRisk(risk: any):"Düşük" |"Orta" |"Yüksek" | null {
 const validRisks = ["Düşük","Orta","Yüksek"];
 if (risk && validRisks.includes(risk)) {
 return risk as"Düşük" |"Orta" |"Yüksek";
 }
 return null;
}

function validateRiskFactors(data: any): any {
 if (!data || typeof data !== 'object') return null;
 
 // Hem uppercase hem title-case değerleri kabul et (geriye dönük uyumluluk için)
 const validLevels = [
"DÜŞÜK","ORTA","YÜKSEK","ÇOK_YÜKSEK", // Uppercase
"Düşük","Orta","Yüksek","Çok Yüksek" // Title-case
 ];
 
 // Zorunlu alanlar kontrolü
 if (!data.academicRiskLevel || !data.behavioralRiskLevel || 
 !data.attendanceRiskLevel || !data.socialEmotionalRiskLevel) {
 return null;
 }
 
 // Level validasyonu - case insensitive
 const normalizeLevel = (level: string) => level.toUpperCase().replace(/\s+/g, '_');
 
 if (!validLevels.some(valid => normalizeLevel(valid) === normalizeLevel(data.academicRiskLevel)) ||
 !validLevels.some(valid => normalizeLevel(valid) === normalizeLevel(data.behavioralRiskLevel)) ||
 !validLevels.some(valid => normalizeLevel(valid) === normalizeLevel(data.attendanceRiskLevel)) ||
 !validLevels.some(valid => normalizeLevel(valid) === normalizeLevel(data.socialEmotionalRiskLevel))) {
 console.warn('Invalid risk level in risk factors:', data);
 return null;
 }
 
 return data;
}

function validateEnhancedRisk(data: any): any {
 if (!data || typeof data !== 'object') return null;
 
 // Zorunlu alanlar kontrolü
 if (typeof data.overallScore !== 'number' || 
 !data.category || 
 !data.trend) {
 return null;
 }
 
 // Score validasyonu
 if (data.overallScore < 0 || data.overallScore > 100) {
 console.warn('Invalid enhanced risk score:', data.overallScore);
 return null;
 }
 
 // Trend validasyonu
 const validTrends = ["increasing","stable","decreasing"];
 if (!validTrends.includes(data.trend)) {
 console.warn('Invalid enhanced risk trend:', data.trend);
 return null;
 }
 
 return data;
}

function validateRiskProtectiveProfile(data: any): any {
 if (!data || typeof data !== 'object') return null;
 
 // Score validasyonu
 if (typeof data.riskScore !== 'number' || typeof data.protectiveScore !== 'number') {
 return null;
 }
 
 if (data.riskScore < 0 || data.riskScore > 100 ||
 data.protectiveScore < 0 || data.protectiveScore > 100) {
 console.warn('Invalid risk/protective scores:', data);
 return null;
 }
 
 return data;
}

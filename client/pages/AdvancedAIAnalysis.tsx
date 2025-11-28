/**
 * Advanced AI Analysis Page (General)
 * Gelişmiş AI Analiz Sayfası (Genel)
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Brain, TrendingUp, Clock, Users, AlertTriangle, BookOpen, Target, Sparkles } from 'lucide-react';
import { 
 generateClassComparison, 
 generateMultiStudentComparison 
} from '@/lib/api/endpoints/advanced-ai-analysis.api';
import { Checkbox } from '@/components/atoms/Checkbox';
import { ScrollArea } from '@/components/organisms/ScrollArea';
import { apiClient } from '@/lib/api';
import { STUDENT_ENDPOINTS } from '@/lib/constants/api-endpoints';
import { AIToolsLayout } from '@/components/features/ai-tools/AIToolsLayout';
import { AIToolsLoadingState } from '@/components/features/ai-tools/AIToolsLoadingState';

export default function AdvancedAIAnalysis() {
 const [analysisMode, setAnalysisMode] = useState<'class' | 'multi-student'>('class');
 const [selectedClass, setSelectedClass] = useState<string>('');
 const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

 // Fetch students data
 const { data: studentsData } = useQuery({
 queryKey: [STUDENT_ENDPOINTS.BASE],
 queryFn: () => apiClient.get(STUDENT_ENDPOINTS.BASE, { showErrorToast: false })
 });

 const students = (studentsData as any[]) || [];
 const classes = [...new Set(students.map((s: any) => s.className).filter(Boolean))];

 // Class comparison
 const { data: classAnalysis, isLoading: classLoading, error: classError } = useQuery({
 queryKey: ['class-comparison', selectedClass],
 queryFn: () => generateClassComparison(selectedClass),
 enabled: analysisMode === 'class' && !!selectedClass,
 staleTime: 10 * 60 * 1000
 });

 // Multi-student comparison
 const { data: multiAnalysis, isLoading: multiLoading, error: multiError } = useQuery({
 queryKey: ['multi-student-comparison', selectedStudents],
 queryFn: () => generateMultiStudentComparison(selectedStudents),
 enabled: analysisMode === 'multi-student' && selectedStudents.length >= 2,
 staleTime: 10 * 60 * 1000
 });

 const analysis = analysisMode === 'class' ? classAnalysis : multiAnalysis;
 const isLoading = analysisMode === 'class' ? classLoading : multiLoading;
 const error = analysisMode === 'class' ? classError : multiError;

 const handleStudentToggle = (studentId: string) => {
 setSelectedStudents(prev => 
 prev.includes(studentId) 
 ? prev.filter(id => id !== studentId)
 : [...prev, studentId]
 );
 };

 if (isLoading) {
 return (
 <AIToolsLoadingState 
 icon={Sparkles}
 message="AI analizi yapılıyor..."
 />
 );
 }

 return (
 <div className="w-full max-w-7xl mx-auto py-6 space-y-6">
 <AIToolsLayout
 title="Gelişmiş AI Karşılaştırmalı Analiz"
 description="Sınıf ve öğrenci grupları arasında derin AI destekli karşılaştırma"
 icon={Sparkles}
 >
 <Tabs value={analysisMode} onValueChange={(v) => setAnalysisMode(v as any)} className="w-auto space-y-6">
 <TabsList className="grid w-full grid-cols-2">
 <TabsTrigger value="class" className="flex items-center gap-2">
 <Users className="h-4 w-4" />
 Sınıf Analizi
 </TabsTrigger>
 <TabsTrigger value="multi-student" className="flex items-center gap-2">
 <Target className="h-4 w-4" />
 Çoklu Öğrenci
 </TabsTrigger>
 </TabsList>

 <TabsContent value="class" className="mt-0">
 <Card>
 <CardHeader>
 <CardTitle>Sınıf Seçimi</CardTitle>
 <CardDescription>Karşılaştırmalı analiz için bir sınıf seçin</CardDescription>
 </CardHeader>
 <CardContent>
 <Select value={selectedClass} onValueChange={setSelectedClass}>
 <SelectTrigger className="w-full">
 <SelectValue placeholder="Sınıf seçin..." />
 </SelectTrigger>
 <SelectContent>
 {classes.map((className) => (
 <SelectItem key={className as string} value={className as string}>
 {className as string}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="multi-student" className="mt-0">
 <Card>
 <CardHeader>
 <CardTitle>Öğrenci Seçimi</CardTitle>
 <CardDescription>
 Karşılaştırma için en az 2 öğrenci seçin ({selectedStudents.length} seçili)
 </CardDescription>
 </CardHeader>
 <CardContent>
 <ScrollArea className="h-[300px]">
 <div className="space-y-2">
 {students.map((student: any) => (
 <div key={student.id} className="flex items-center space-x-2 p-2 rounded-lg">
 <Checkbox
 id={student.id}
 checked={selectedStudents.includes(student.id)}
 onCheckedChange={() => handleStudentToggle(student.id)}
 />
 <label
 htmlFor={student.id}
 className="flex-1 cursor-pointer text-sm"
 >
 {student.name} {student.surname} - {student.className}
 </label>
 </div>
 ))}
 </div>
 </ScrollArea>
 {selectedStudents.length > 0 && selectedStudents.length < 2 && (
 <p className="text-sm text-muted-foreground mt-2">En az 2 öğrenci seçmelisiniz</p>
 )}
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>

 {error && (
 <Card className="border-destructive">
 <CardContent className="pt-6">
 <div className="text-center py-12">
 <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
 <p className="text-destructive">Analiz oluşturulamadı</p>
 </div>
 </CardContent>
 </Card>
 )}

 {!error && !analysis && (
 <Card>
 <CardContent className="pt-6">
 <div className="text-center py-12 text-muted-foreground">
 <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
 <p>{analysisMode === 'class' ? 'Sınıf seçin' : 'En az 2 öğrenci seçin'} ve AI analiz başlasın</p>
 </div>
 </CardContent>
 </Card>
 )}

 {analysis && (
 <div className="space-y-6">
 {/* Class Metrics Overview */}
 <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Brain className="h-5 w-5" />
 Sınıf Metrikleri
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 <div className="p-3 bg-white rounded-lg">
 <p className="text-sm text-muted-foreground">Toplam Öğrenci</p>
 <p className="text-2xl font-bold">{analysis.studentCount}</p>
 </div>
 <div className="p-3 bg-white rounded-lg">
 <p className="text-sm text-muted-foreground">Ortalama Akademik</p>
 <p className="text-2xl font-bold">{analysis.classLevelMetrics.averageAcademicScore.toFixed(1)}</p>
 </div>
 <div className="p-3 bg-white rounded-lg">
 <p className="text-sm text-muted-foreground">Yüksek Risk</p>
 <p className="text-2xl font-bold text-red-600">{analysis.classLevelMetrics.highRiskCount}</p>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Student Comparisons */}
 {analysis.studentComparisons && analysis.studentComparisons.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle>Öğrenci Karşılaştırmaları</CardTitle>
 <CardDescription>Öğrencilerin detaylı karşılaştırması</CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 <ScrollArea className="h-[400px]">
 {analysis.studentComparisons.map((student: any, i: number) => (
 <div key={i} className="p-4 bg-muted rounded-lg mb-3">
 <div className="flex items-center justify-between mb-2">
 <h3 className="font-semibold">{student.studentName}</h3>
 <Badge variant={
 student.riskLevel === 'KRİTİK' ? 'destructive' :
 student.riskLevel === 'YÜKSEK' ? 'default' : 'secondary'
 }>
 {student.riskLevel}
 </Badge>
 </div>
 <div className="grid md:grid-cols-2 gap-4 text-sm">
 <div>
 <span className="font-medium text-green-600">Güçlü Yönler:</span>
 <ul className="list-disc list-inside mt-1 ml-2">
 {student.keyStrengths?.map((strength: string, j: number) => (
 <li key={j}>{strength}</li>
 ))}
 </ul>
 </div>
 <div>
 <span className="font-medium text-orange-600">Zorluklar:</span>
 <ul className="list-disc list-inside mt-1 ml-2">
 {student.keyChallenges?.map((challenge: string, j: number) => (
 <li key={j}>{challenge}</li>
 ))}
 </ul>
 </div>
 </div>
 </div>
 ))}
 </ScrollArea>
 </CardContent>
 </Card>
 )}

 {/* Risk Correlations */}
 {analysis.riskCorrelations && analysis.riskCorrelations.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <AlertTriangle className="h-5 w-5" />
 Risk Korelasyonları
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {analysis.riskCorrelations.map((corr: any, i: number) => (
 <div key={i} className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded-lg">
 <div className="flex items-center justify-between mb-2">
 <h3 className="font-semibold">{corr.factor1} ↔ {corr.factor2}</h3>
 <Badge >
 Güç: {(corr.strength * 100).toFixed(0)}%
 </Badge>
 </div>
 <p className="text-sm mb-2">{corr.explanation}</p>
 <p className="text-sm"><span className="font-medium">Etkilenen:</span> {corr.affectedCount} öğrenci</p>
 <p className="text-sm"><span className="font-medium">Önleme:</span> {corr.preventionStrategy}</p>
 </div>
 ))}
 </CardContent>
 </Card>
 )}

 {/* Comparative Insights */}
 {analysis.comparativeInsights && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <TrendingUp className="h-5 w-5" />
 Karşılaştırmalı İçgörüler
 </CardTitle>
 </CardHeader>
 <CardContent className="grid md:grid-cols-2 gap-4">
 <div className="p-4 bg-green-50 rounded-lg">
 <h3 className="font-semibold text-green-700 mb-2">Güçlü Alanlar</h3>
 <ul className="list-disc list-inside text-sm space-y-1">
 {analysis.comparativeInsights.strengthAreas?.map((area: string, i: number) => (
 <li key={i}>{area}</li>
 ))}
 </ul>
 </div>
 <div className="p-4 bg-red-50 rounded-lg">
 <h3 className="font-semibold text-red-700 mb-2">Gelişim Alanları</h3>
 <ul className="list-disc list-inside text-sm space-y-1">
 {analysis.comparativeInsights.challengeAreas?.map((area: string, i: number) => (
 <li key={i}>{area}</li>
 ))}
 </ul>
 </div>
 <div className="p-4 bg-blue-50 rounded-lg">
 <h3 className="font-semibold text-blue-700 mb-2">Başarı Faktörleri</h3>
 <ul className="list-disc list-inside text-sm space-y-1">
 {analysis.comparativeInsights.successFactors?.map((factor: string, i: number) => (
 <li key={i}>{factor}</li>
 ))}
 </ul>
 </div>
 <div className="p-4 bg-orange-50 rounded-lg">
 <h3 className="font-semibold text-orange-700 mb-2">Sistemik Sorunlar</h3>
 <ul className="list-disc list-inside text-sm space-y-1">
 {analysis.comparativeInsights.systemicIssues?.map((issue: string, i: number) => (
 <li key={i}>{issue}</li>
 ))}
 </ul>
 </div>
 </CardContent>
 </Card>
 )}

 {/* Recommendations */}
 {analysis.prioritizedRecommendations && analysis.prioritizedRecommendations.length > 0 && (
 <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Target className="h-5 w-5" />
 Grup Düzeyi Öneriler
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {analysis.prioritizedRecommendations.map((rec: any, i: number) => (
 <div key={i} className="bg-white p-4 rounded-lg border">
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-2">
 <Badge variant={rec.priority === 'ACİL' ? 'destructive' : rec.priority === 'YÜKSEK' ? 'default' : 'secondary'}>
 {rec.priority}
 </Badge>
 <Badge variant="outline">{rec.targetGroup}</Badge>
 </div>
 </div>
 <p className="text-sm mb-2 font-medium">{rec.recommendation}</p>
 <div className="text-xs space-y-1">
 <p><span className="font-medium">Beklenen Etki:</span> {rec.expectedImpact}</p>
 <p><span className="font-medium">Süre:</span> {rec.timeline}</p>
 {rec.resources && rec.resources.length > 0 && (
 <p><span className="font-medium">Kaynaklar:</span> {rec.resources.join(', ')}</p>
 )}
 </div>
 </div>
 ))}
 </CardContent>
 </Card>
 )}
 </div>
 )}
 </AIToolsLayout>
 </div>
 );
}

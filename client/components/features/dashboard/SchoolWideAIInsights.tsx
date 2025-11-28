import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, EyeOff, RefreshCw, Loader2 } from 'lucide-react';
import { generateClassComparison } from '@/lib/api/endpoints/advanced-ai-analysis.api';

interface SchoolWideAIInsightsProps {
 onHide?: () => void;
 className?: string;
}

export default function SchoolWideAIInsights({ onHide, className }: SchoolWideAIInsightsProps) {
 const [insights, setInsights] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [selectedClass, setSelectedClass] = useState<string>('');

 const loadInsights = async () => {
 if (!selectedClass) {
 setLoading(false);
 return;
 }
 
 setLoading(true);
 try {
 const data = await generateClassComparison(selectedClass);
 setInsights(data);
 } catch (error) {
 console.error('Sınıf analizi yüklenirken hata:', error);
 setInsights(null);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 const fetchDefaultClass = async () => {
 try {
 const { apiClient, createApiHandler } = await import('@/lib/api/core/client');
 const students = await createApiHandler(
 async () => {
 return await apiClient.get<{ data: Array<{ className?: string }> }>(
 '/api/students',
 { showErrorToast: false }
 );
 },
 { data: [] }
 )();
 const classes = [...new Set(students.data?.map((s: any) => s.className).filter(Boolean))];
 if (classes.length > 0) {
 setSelectedClass(classes[0] as string);
 }
 } catch (error) {
 console.error('Sınıflar yüklenirken hata:', error);
 }
 };
 fetchDefaultClass();
 }, []);

 useEffect(() => {
 if (selectedClass) {
 loadInsights();
 }
 }, [selectedClass]);

 if (loading) {
 return (
 <Card className={`border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 ${className}`}>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Brain className="h-5 w-5 text-purple-600" />
 Okul Çapında AI İçgörüler
 </CardTitle>
 </CardHeader>
 <CardContent className="flex justify-center py-8">
 <Loader2 className="h-6 w-6 text-purple-600" />
 </CardContent>
 </Card>
 );
 }

 if (!insights) {
 return (
 <Card className={`border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 ${className}`}>
 <CardHeader className="flex flex-row items-center justify-between pb-3">
 <div>
 <CardTitle className="flex items-center gap-2">
 <Brain className="h-5 w-5 text-purple-600" />
 Okul Çapında AI İçgörüler
 </CardTitle>
 <CardDescription>Sınıf analizi bekleniyor</CardDescription>
 </div>
 {onHide && (
 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onHide}>
 <EyeOff className="h-3 w-3" />
 </Button>
 )}
 </CardHeader>
 <CardContent>
 <p className="text-sm text-muted-foreground">Sınıf seçildikten sonra analiz gösterilecek.</p>
 </CardContent>
 </Card>
 );
 }

 const topStrengths = insights.comparativeInsights?.strengthAreas?.slice(0, 2) || [];
 const topChallenges = insights.comparativeInsights?.challengeAreas?.slice(0, 2) || [];

 return (
 <Card className={`border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 ${className}`}>
 <CardHeader className="flex flex-row items-center justify-between pb-3">
 <div>
 <CardTitle className="flex items-center gap-2 text-purple-700">
 <Brain className="h-5 w-5" />
 Sınıf AI Analizi
 </CardTitle>
 <CardDescription>{selectedClass} analiz özeti</CardDescription>
 </div>
 <div className="flex items-center gap-1">
 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={loadInsights}>
 <RefreshCw className="h-3 w-3" />
 </Button>
 {onHide && (
 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onHide}>
 <EyeOff className="h-3 w-3" />
 </Button>
 )}
 </div>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="grid grid-cols-3 gap-2 text-center">
 <div className="p-2 bg-white/50 rounded">
 <p className="text-xs text-muted-foreground">Öğrenci</p>
 <p className="text-sm font-bold">{insights.studentCount}</p>
 </div>
 <div className="p-2 bg-white/50 rounded">
 <p className="text-xs text-muted-foreground">Ort. Not</p>
 <p className="text-sm font-bold">{insights.classLevelMetrics?.averageAcademicScore?.toFixed(1) || 'N/A'}</p>
 </div>
 <div className="p-2 bg-white/50 rounded">
 <p className="text-xs text-muted-foreground">Yüksek Risk</p>
 <p className="text-sm font-bold text-red-600">{insights.classLevelMetrics?.highRiskCount || 0}</p>
 </div>
 </div>

 {topStrengths.length > 0 && (
 <div>
 <div className="flex items-center gap-2 mb-1">
 <TrendingUp className="h-4 w-4 text-green-600" />
 <span className="text-sm font-medium">Güçlü Yönler</span>
 </div>
 <div className="space-y-1">
 {topStrengths.map((strength: string, i: number) => (
 <p key={i} className="text-xs truncate">{strength}</p>
 ))}
 </div>
 </div>
 )}

 {topChallenges.length > 0 && (
 <div>
 <div className="flex items-center gap-2 mb-1">
 <AlertTriangle className="h-4 w-4 text-orange-600" />
 <span className="text-sm font-medium">Gelişim Alanları</span>
 </div>
 <div className="space-y-1">
 {topChallenges.map((challenge: string, i: number) => (
 <p key={i} className="text-xs truncate">{challenge}</p>
 ))}
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 );
}

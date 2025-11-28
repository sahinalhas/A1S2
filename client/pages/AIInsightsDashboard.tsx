import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { StatCard } from '@/components/molecules/StatCard';
import { StatsGrid } from '@/components/molecules/StatsGrid';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { AlertTriangle, TrendingUp, Users, Calendar, Brain, FileText } from 'lucide-react';
import { MODERN_GRADIENTS } from '@/lib/config/theme.config';
import BulkAnalysisDashboard from '@/components/features/ai/BulkAnalysisDashboard';
import { apiClient } from '@/lib/api/core/client';
import { AI_ENDPOINTS } from '@/lib/constants/api-endpoints';
import { AIToolsLayout } from '@/components/features/ai-tools/AIToolsLayout';
import { AIToolsLoadingState } from '@/components/features/ai-tools/AIToolsLoadingState';

interface DailyInsightsSummary {
 date: string;
 insight: {
 summary: string;
 totalStudents: number;
 highRiskCount: number;
 mediumRiskCount: number;
 criticalAlertsCount: number;
 newAlertsCount: number;
 keyFindings?: string;
 aiInsights?: string;
 };
 priorityStudents: any[];
 criticalAlerts: any[];
 positiveUpdates: any[];
 recommendedActions: string[];
}

export default function AIInsightsDashboard() {
 const [insights, setInsights] = useState<DailyInsightsSummary | null>(null);
 const [loading, setLoading] = useState(true);
 const [generating, setGenerating] = useState(false);

 useEffect(() => {
 loadInsights();
 }, []);

 const loadInsights = async () => {
 try {
 const response = await apiClient.get<any>(
 AI_ENDPOINTS.DAILY_INSIGHTS,
 { showErrorToast: false }
 );
 // Backend'den { data: ... } formatında geliyor
 const data = response?.data || response;
 if (data) {
 setInsights(data);
 }
 } catch (error) {
 console.error('Failed to load insights:', error);
 } finally {
 setLoading(false);
 }
 };

 const generateNewInsights = async () => {
 setGenerating(true);
 try {
 await apiClient.post(
 AI_ENDPOINTS.GENERATE_INSIGHTS,
 {},
 {
 showSuccessToast: true,
 successMessage: 'Yeni analiz oluşturuldu',
 showErrorToast: true,
 }
 );
 await loadInsights();
 } catch (error) {
 console.error('Failed to generate insights:', error);
 } finally {
 setGenerating(false);
 }
 };

 if (loading) {
 return (
 <AIToolsLoadingState 
 icon={Brain}
 message="Günlük insights yükleniyor..."
 />
 );
 }

 return (
 <div className="w-full max-w-7xl mx-auto py-6 space-y-6">
 <AIToolsLayout
 title="AI Rehber Asistan Dashboard"
 description="Günlük otomatik analiz ve akıllı öneriler"
 icon={Brain}
 >
 <Tabs defaultValue="daily" className="w-full space-y-6">
 <TabsList className="grid w-full grid-cols-2">
 <TabsTrigger value="daily">
 Günlük Insights
 </TabsTrigger>
 <TabsTrigger value="bulk">
 Toplu Analiz
 </TabsTrigger>
 </TabsList>

 <TabsContent value="daily" className="space-y-6 mt-0 min-h-[400px]">
 <div className="flex justify-end">
 <Button onClick={generateNewInsights} disabled={generating}>
 {generating ? 'Oluşturuluyor...' : 'Yeni Analiz Oluştur'}
 </Button>
 </div>

 {insights && (
 <>
 {/* Özet Kartları */}
 <StatsGrid columns={4}>
 <StatCard
 title="Toplam Öğrenci"
 value={insights.insight.totalStudents}
 icon={Users}
 gradient={MODERN_GRADIENTS.blue}
 delay={0}
 />
 <StatCard
 title="Yüksek Risk"
 value={insights.insight.highRiskCount}
 icon={AlertTriangle}
 gradient={MODERN_GRADIENTS.rose}
 delay={0.1}
 />
 <StatCard
 title="Kritik Uyarı"
 value={insights.insight.criticalAlertsCount}
 icon={AlertTriangle}
 gradient={MODERN_GRADIENTS.amber}
 delay={0.2}
 />
 <StatCard
 title="Yeni Uyarı"
 value={insights.insight.newAlertsCount}
 icon={TrendingUp}
 gradient={MODERN_GRADIENTS.cyan}
 delay={0.3}
 />
 </StatsGrid>

 {/* Ana Bulgular ve AI Insights */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <FileText className="w-5 h-5" />
 Günlük Özet
 </CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-sm whitespace-pre-wrap">{insights.insight.summary}</p>
 {insights.insight.keyFindings && (
 <div className="mt-4 p-3 bg-muted rounded-lg">
 <h4 className="font-medium mb-2">Ana Bulgular:</h4>
 <p className="text-sm whitespace-pre-wrap">{insights.insight.keyFindings}</p>
 </div>
 )}
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Brain className="w-5 h-5" />
 AI Analizi
 </CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-sm whitespace-pre-wrap">
 {insights.insight.aiInsights || 'AI analizi mevcut değil'}
 </p>
 </CardContent>
 </Card>
 </div>

 {/* Öncelikli Aksiyonlar */}
 {insights.recommendedActions.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Calendar className="w-5 h-5" />
 Önerilen Aksiyonlar
 </CardTitle>
 <CardDescription>Bugün yapılması gerekenler</CardDescription>
 </CardHeader>
 <CardContent>
 <ul className="space-y-2">
 {insights.recommendedActions.map((action, i) => (
 <li key={i} className="flex items-start gap-2">
 <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm shrink-0">
 {i + 1}
 </span>
 <span className="text-sm">{action}</span>
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>
 )}

 {/* Kritik Uyarılar */}
 {insights.criticalAlerts.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-red-600">
 <AlertTriangle className="w-5 h-5" />
 Kritik Uyarılar
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {insights.criticalAlerts.map((alert) => (
 <div key={alert.id} className="border-l-4 border-red-500 pl-4 py-2">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <h4 className="font-medium">{alert.title}</h4>
 <p className="text-sm text-muted-foreground mt-1">
 {alert.description}
 </p>
 {alert.recommendation && (
 <p className="text-sm text-blue-600 mt-2">
 {alert.recommendation}
 </p>
 )}
 </div>
 <Badge variant="destructive">{alert.severity}</Badge>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 )}

 {/* Pozitif Gelişmeler */}
 {insights.positiveUpdates.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-green-600">
 <TrendingUp className="w-5 h-5" />
 Pozitif Gelişmeler
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {insights.positiveUpdates.map((update) => (
 <div key={update.id} className="border-l-4 border-green-500 pl-4 py-2">
 <h4 className="font-medium">{update.title}</h4>
 <p className="text-sm text-muted-foreground mt-1">
 {update.description}
 </p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 )}
 </>
 )}
 </TabsContent>

 <TabsContent value="bulk" className="mt-0 min-h-[400px]">
 <BulkAnalysisDashboard />
 </TabsContent>
 </Tabs>
 </AIToolsLayout>
 </div>
 );
}

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Sparkles, Clock, Users, Target, Eye, EyeOff, RefreshCw, Loader2 } from 'lucide-react';
import { getTodayActionPlan } from '@/lib/api/endpoints/advanced-ai-analysis.api';

interface DailyActionPlanWidgetProps {
 onHide?: () => void;
}

export default function DailyActionPlanWidget({ onHide }: DailyActionPlanWidgetProps) {
 const [plan, setPlan] = useState<any>(null);
 const [loading, setLoading] = useState(true);

 const loadPlan = async () => {
 setLoading(true);
 try {
 const data = await getTodayActionPlan();
 setPlan(data);
 } catch (error) {
 console.error('Günlük plan yüklenirken hata:', error);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 loadPlan();
 }, []);

 if (loading) {
 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Sparkles className="h-5 w-5 text-primary" />
 AI Günlük Plan
 </CardTitle>
 </CardHeader>
 <CardContent className="flex justify-center py-8">
 <Loader2 className="h-6 w-6 text-primary" />
 </CardContent>
 </Card>
 );
 }

 if (!plan) {
 return (
 <Card>
 <CardHeader className="flex flex-row items-center justify-between">
 <div className="space-y-2">
 <CardTitle className="flex items-center gap-2">
 <Sparkles className="h-5 w-5 text-primary" />
 AI Günlük Plan
 </CardTitle>
 <CardDescription>Henüz plan oluşturulmadı</CardDescription>
 </div>
 {onHide && (
 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onHide}>
 <EyeOff className="h-4 w-4" />
 </Button>
 )}
 </CardHeader>
 <CardContent>
 <p className="text-sm text-muted-foreground">Günlük eylem planı yüklenemedi.</p>
 </CardContent>
 </Card>
 );
 }

 const priorityStudents = plan.priorityStudents?.slice(0, 3) || [];

 return (
 <Card>
 <CardHeader className="flex flex-row items-center justify-between">
 <div className="space-y-2">
 <CardTitle className="flex items-center gap-2 text-primary">
 <Sparkles className="h-5 w-5" />
 AI Günlük Plan
 </CardTitle>
 <CardDescription>Bugün için öneriler</CardDescription>
 </div>
 <div className="flex items-center gap-2">
 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={loadPlan}>
 <RefreshCw className="h-4 w-4" />
 </Button>
 {onHide && (
 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onHide}>
 <EyeOff className="h-4 w-4" />
 </Button>
 )}
 </div>
 </CardHeader>
 <CardContent className="space-y-5">
 {priorityStudents.length > 0 && (
 <div>
 <div className="flex items-center gap-2 mb-2">
 <Users className="h-4 w-4 text-orange-600" />
 <span className="text-sm font-medium">Öncelikli Öğrenciler</span>
 </div>
 <div className="space-y-1">
 {priorityStudents.map((student: any, i: number) => (
 <div key={i} className="flex items-center justify-between text-xs">
 <span className="truncate">{student.studentName}</span>
 <Badge variant="outline" className="text-xs">
 {student.urgencyLevel}
 </Badge>
 </div>
 ))}
 </div>
 </div>
 )}
 
 {plan.upcomingDeadlines && plan.upcomingDeadlines.length > 0 && (
 <div>
 <div className="flex items-center gap-2 mb-2">
 <Clock className="h-4 w-4 text-blue-600" />
 <span className="text-sm font-medium">Yaklaşan Görevler</span>
 </div>
 <div className="space-y-1">
 {plan.upcomingDeadlines.slice(0, 2).map((task: any, i: number) => (
 <div key={i} className="text-xs">
 <p className="truncate">{task.task}</p>
 </div>
 ))}
 </div>
 </div>
 )}

 {plan.recommendedActions && plan.recommendedActions.length > 0 && (
 <div>
 <div className="flex items-center gap-2 mb-2">
 <Target className="h-4 w-4 text-green-600" />
 <span className="text-sm font-medium">Önerilen Aksiyonlar</span>
 </div>
 <div className="space-y-1">
 {plan.recommendedActions.slice(0, 2).map((action: string, i: number) => (
 <p key={i} className="text-xs truncate">{action}</p>
 ))}
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 );
}

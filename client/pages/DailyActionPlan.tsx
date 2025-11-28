/**
 * Daily Action Plan Page
 * Günlük Eylem Planı Sayfası
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, AlertTriangle, CheckCircle2, Users, FileText, Phone, Activity } from 'lucide-react';
import { getTodayActionPlan, generateDailyActionPlan } from '@/lib/api/endpoints/advanced-ai-analysis.api';
import type { CounselorDailyPlan, HourlyAction } from '../../shared/types/advanced-ai-analysis.types';
import { AIToolsLayout } from '@/components/features/ai-tools/AIToolsLayout';
import { AIToolsLoadingState } from '@/components/features/ai-tools/AIToolsLoadingState';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';

export default function DailyActionPlan() {
 const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

 const { data: plan, isLoading, error, refetch } = useQuery({
 queryKey: ['daily-action-plan', selectedDate],
 queryFn: () => selectedDate === new Date().toISOString().split('T')[0] 
 ? getTodayActionPlan() 
 : generateDailyActionPlan(selectedDate),
 staleTime: 60 * 60 * 1000
 });

 const handleRefresh = async () => {
 await generateDailyActionPlan(selectedDate, undefined, true);
 refetch();
 };

 const getActionIcon = (type: HourlyAction['actionType']) => {
 switch (type) {
 case 'GÖRÜŞME': return <Users className="w-4 h-4" />;
 case 'İZLEME': return <Activity className="w-4 h-4" />;
 case 'MÜDAHALE': return <AlertTriangle className="w-4 h-4" />;
 case 'DÖKÜMENTASYON': return <FileText className="w-4 h-4" />;
 case 'AİLE_İLETİŞİMİ': return <Phone className="w-4 h-4" />;
 case 'ACİL': return <AlertTriangle className="w-4 h-4 text-red-500" />;
 default: return <Clock className="w-4 h-4" />;
 }
 };

 const getPriorityColor = (priority: HourlyAction['priority']) => {
 switch (priority) {
 case 'ACİL': return 'border-red-500 bg-red-50';
 case 'YÜKSEK': return 'border-orange-500 bg-orange-50';
 case 'ORTA': return 'border-yellow-500 bg-yellow-50';
 case 'DÜŞÜK': return 'border-gray-400 bg-gray-50';
 }
 };

 if (isLoading) {
 return (
 <AIToolsLoadingState 
 icon={Calendar}
 message="Günlük plan hazırlanıyor..."
 />
 );
 }

 if (error) {
 return (
 <AIToolsLayout
 title="Günlük Eylem Planı"
 icon={Calendar}
 >
 <div className="text-center py-12">
 <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
 <p className="text-red-600">Plan oluşturulamadı</p>
 <Button
 onClick={() => refetch()}
 className="mt-4"
 >
 Tekrar Dene
 </Button>
 </div>
 </AIToolsLayout>
 );
 }

 if (!plan) return null;

 return (
 <div className="w-full max-w-7xl mx-auto py-6 space-y-6">
 <AIToolsLayout
 title="Günlük Eylem Planı"
 description={plan.counselorName}
 icon={Calendar}
 actions={
 <div className="flex items-center gap-4">
 <input
 type="date"
 value={selectedDate}
 onChange={(e) => setSelectedDate(e.target.value)}
 className="px-4 py-2 border rounded-md"
 />
 <Button onClick={handleRefresh}>
 Yeni Plan Oluştur
 </Button>
 </div>
 }
 >
 <div className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className="bg-white p-4 rounded-lg border">
 <div className="text-sm text-muted-foreground">Toplam Aksiyon</div>
 <div className="text-2xl font-bold mt-1">{plan.dailySummary?.totalActions || 0}</div>
 </div>
 <div className="bg-red-50 p-4 rounded-lg border border-red-200">
 <div className="text-sm text-red-700">Kritik Öncelikli</div>
 <div className="text-2xl font-bold mt-1 text-red-600">{plan.dailySummary?.criticalCount || 0}</div>
 </div>
 <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
 <div className="text-sm text-orange-700">Yüksek Öncelikli</div>
 <div className="text-2xl font-bold mt-1 text-orange-600">{plan.dailySummary?.highPriorityCount || 0}</div>
 </div>
 <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
 <div className="text-sm text-blue-700">İş Yükü</div>
 <div className="text-xl font-semibold mt-1 text-blue-600">{plan.dailySummary?.estimatedWorkload || 'Hesaplanıyor'}</div>
 </div>
 </div>

 <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg border">
 <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
 <Calendar className="w-5 h-5" />
 Sabah Brifing
 </h2>
 
 {plan.morningBriefing?.urgentMatters?.length > 0 && (
 <div className="mb-4">
 <h3 className="font-semibold text-red-600 mb-2">🚨 Acil Konular</h3>
 <ul className="list-disc list-inside space-y-1">
 {plan.morningBriefing.urgentMatters.map((matter, i) => (
 <li key={i} className="text-sm">{matter}</li>
 ))}
 </ul>
 </div>
 )}

 {plan.morningBriefing?.keyStudentsToMonitor?.length > 0 && (
 <div className="mb-4">
 <h3 className="font-semibold mb-2">👀 İzlenecek Öğrenciler</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
 {plan.morningBriefing.keyStudentsToMonitor.map((student, i) => (
 <div key={i} className="bg-white p-3 rounded border">
 <div className="font-medium">{student.name} {student.surname || ''}</div>
 <div className="text-sm text-muted-foreground">{student.reason}</div>
 <div className="text-xs text-blue-600 mt-1">{student.suggestedTime}</div>
 </div>
 ))}
 </div>
 </div>
 )}

 {plan.morningBriefing?.preparationTasks?.length > 0 && (
 <div>
 <h3 className="font-semibold mb-2">Hazırlık Görevleri</h3>
 <ul className="list-disc list-inside space-y-1">
 {plan.morningBriefing.preparationTasks.map((task, i) => (
 <li key={i} className="text-sm">{task}</li>
 ))}
 </ul>
 </div>
 )}
 </div>

 <div className="bg-white rounded-lg border">
 <div className="p-4 border-b bg-gray-50">
 <h2 className="text-xl font-semibold flex items-center gap-2">
 <Clock className="w-5 h-5" />
 Saatlik Program
 </h2>
 </div>
 <div className="divide-y">
 {plan.hourlySchedule?.map((action, i) => (
 <div
 key={i}
 className={`p-4 border-l-4 ${getPriorityColor(action.priority)}`}
 >
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-2">
 <div className="flex items-center gap-2">
 {getActionIcon(action.actionType)}
 <span className="font-semibold text-lg">{action.timeSlot}</span>
 </div>
 <span className={`px-2 py-1 rounded text-xs font-medium ${
 action.priority === 'ACİL' ? 'bg-red-100 text-red-700' :
 action.priority === 'YÜKSEK' ? 'bg-orange-100 text-orange-700' :
 action.priority === 'ORTA' ? 'bg-yellow-100 text-yellow-700' :
 'bg-gray-100 text-gray-700'
 }`}>
 {action.priority}
 </span>
 <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
 {action.actionType}
 </span>
 </div>

 {action.studentName && (
 <div className="text-sm font-medium text-purple-600 mb-1">
 👤 {action.studentName}
 </div>
 )}

 <div className="font-medium mb-2">{action.action}</div>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
 <div>
 <span className="text-muted-foreground">Süre:</span> {action.duration} dk
 </div>
 <div className="md:col-span-2">
 <span className="text-muted-foreground">Beklenen Sonuç:</span> {action.expectedOutcome}
 </div>
 </div>

 {action.preparationNeeded?.length > 0 && (
 <div className="mt-2 text-sm">
 <span className="text-muted-foreground">Hazırlık:</span>{' '}
 {Array.isArray(action.preparationNeeded) ? action.preparationNeeded.join(', ') : action.preparationNeeded}
 </div>
 )}

 {action.resources?.length > 0 && (
 <div className="mt-1 text-sm">
 <span className="text-muted-foreground">Kaynaklar:</span>{' '}
 {Array.isArray(action.resources) ? action.resources.join(', ') : action.resources}
 </div>
 )}

 {action.followUp && (
 <div className="mt-2 text-sm bg-blue-50 p-2 rounded border border-blue-200">
 <span className="text-blue-700 font-medium">Takip:</span> {action.followUp}
 </div>
 )}
 </div>
 </div>
 </div>
 )) || <div className="p-8 text-center text-muted-foreground">Henüz saatlik program oluşturulmamış</div>}
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-white p-4 rounded-lg border">
 <h3 className="font-semibold mb-3 flex items-center gap-2">
 <Activity className="w-5 h-5" />
 Esneklik Önerileri
 </h3>
 <div className="space-y-3 text-sm">
 {plan.flexibilityRecommendations?.bufferTimes?.length > 0 && (
 <div>
 <div className="font-medium text-muted-foreground mb-1">Tampon Zamanlar:</div>
 <div>{plan.flexibilityRecommendations.bufferTimes.join(', ')}</div>
 </div>
 )}
 {plan.flexibilityRecommendations?.contingencyPlans?.length > 0 && (
 <div>
 <div className="font-medium text-muted-foreground mb-1">Beklenmedik Durumlar:</div>
 <ul className="space-y-1">
 {plan.flexibilityRecommendations.contingencyPlans.map((cp, i) => (
 <li key={i}>
 <span className="font-medium">{cp.scenario}:</span> {cp.action}
 </li>
 ))}
 </ul>
 </div>
 )}
 </div>
 </div>

 <div className="bg-white p-4 rounded-lg border">
 <h3 className="font-semibold mb-3 flex items-center gap-2">
 <CheckCircle2 className="w-5 h-5" />
 Gün Sonu Kontrol
 </h3>
 <ul className="space-y-2">
 {plan.endOfDayChecklist?.map((item, i) => (
 <li key={i} className="flex items-start gap-2">
 <input type="checkbox" className="mt-1" />
 <span className="text-sm">{item}</span>
 </li>
 )) || <li className="text-sm text-muted-foreground">Kontrol listesi hazırlanıyor...</li>}
 </ul>
 </div>
 </div>

 {plan.tomorrowPrep?.length > 0 && (
 <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg border">
 <h3 className="font-semibold mb-3">🌅 Yarına Hazırlık</h3>
 <ul className="list-disc list-inside space-y-1 text-sm">
 {plan.tomorrowPrep.map((item, i) => (
 <li key={i}>{item}</li>
 ))}
 </ul>
 </div>
 )}
 </div>
 </AIToolsLayout>
 </div>
 );
}

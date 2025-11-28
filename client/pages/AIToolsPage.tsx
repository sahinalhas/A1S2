import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Brain, Zap, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { AI_TOOLS_TABS, VALID_AI_TOOLS_TABS } from '@/config/tabs';
import { AIToolsLoadingState } from '@/components/features/ai-tools/AIToolsLoadingState';
import { Badge } from '@/components/atoms/Badge';
import { Card, CardContent } from '@/components/organisms/Card'; // Added Card and CardContent import

const RiskDashboard = lazy(() => import('./RiskDashboard'));
const AIAssistant = lazy(() => import('./AIAssistant'));
const AIInsightsDashboard = lazy(() => import('./AIInsightsDashboard'));
const AdvancedAIAnalysis = lazy(() => import('./AdvancedAIAnalysis'));
const DailyActionPlan = lazy(() => import('./DailyActionPlan'));

export default function AIToolsPage() {
 const [searchParams] = useSearchParams();

 // Read initial tab from URL, but default to 'risk' if invalid
 const getValidTab = (tab: string | null): string => {
 if (tab && VALID_AI_TOOLS_TABS.includes(tab as any)) {
 return tab;
 }
 return 'risk';
 };

 const initialTab = getValidTab(searchParams.get('tab'));
 const [activeTab, setActiveTab] = useState(initialTab);

 // Update active tab if URL changes (e.g., from navigation)
 // Only watch searchParams, not activeTab, to avoid reverting user's manual tab changes
 useEffect(() => {
 const urlTab = searchParams.get('tab');
 const validTab = getValidTab(urlTab);
 setActiveTab(validTab);
 }, [searchParams]);

 // Handle tab change - only update local state, don't modify URL
 const handleTabChange = (value: string) => {
 setActiveTab(value);
 };

 // Mock stats data for demonstration purposes. In a real application, this would come from an API.
 const stats = {
 totalStudents: 1250,
 highRiskCount: 15,
 activeWarnings: 8,
 pendingSuggestions: 3,
 };

 return (
 <div className="w-full min-h-screen pb-6">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: 0.5 }}
 className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 text-white mb-6"
 >
 <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
 <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

 <div className="relative max-w-7xl mx-auto px-6 py-12">
 <div className="flex items-center justify-between flex-wrap gap-6">
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.5, delay: 0.1 }}
 className="flex-1"
 >
 <div className="flex items-center gap-3 mb-3">
 <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
 <Brain className="h-7 w-7" />
 </div>
 <h1 className="text-4xl font-bold tracking-tight">AI Araçları</h1>
 </div>
 <p className="text-white/90 text-base max-w-2xl">
 Yapay zeka destekli analiz ve raporlama araçları
 </p>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.5, delay: 0.2 }}
 className="flex gap-3 flex-wrap"
 >
 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
 <Zap className="h-3.5 w-3.5 text-yellow-300" />
 <span className="text-xs text-white font-medium">Hızlı Analiz</span>
 </div>
 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
 <TrendingUp className="h-3.5 w-3.5 text-green-300" />
 <span className="text-xs text-white font-medium">Akıllı Öneriler</span>
 </div>
 </motion.div>
 </div>

 <motion.div
 className="hidden md:block opacity-30"
 animate={{ rotate: 360 }}
 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
 style={{ position: 'absolute', right: '8%', top: '50%', transform: 'translateY(-50%)' }}
 >
 <Brain className="h-20 w-20 text-white" />
 </motion.div>
 </div>
 </motion.div>

 <div className="space-y-6 max-w-7xl mx-auto px-6">
 {/* Tabs Container */}
 <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
 {/* Responsive Tab List */}
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 >
 <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 bg-white/80 backdrop-blur-sm border border-border/40 shadow-sm">
 {AI_TOOLS_TABS.map((tabConfig) => (
 <TabsTrigger 
 key={tabConfig.value} 
 value={tabConfig.value}
 className="gap-2"
 title={tabConfig.description}
 >
 {tabConfig.icon && <tabConfig.icon className="h-4 w-4" />}
 <span className="hidden sm:inline">{tabConfig.label}</span>
 </TabsTrigger>
 ))}
 </TabsList>
 </motion.div>

 {/* Tab Contents */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.2 }}
 >
 <TabsContent value="risk" className="min-h-[600px]">
 <Suspense fallback={<AIToolsLoadingState icon={AI_TOOLS_TABS[0].icon!} message="Risk verileri yükleniyor..." />}>
 <RiskDashboard />
 </Suspense>
 </TabsContent>

 <TabsContent value="ai-asistan" className="min-h-[600px]">
 <Suspense fallback={<AIToolsLoadingState icon={AI_TOOLS_TABS[1].icon!} message="AI Asistan yükleniyor..." />}>
 <AIAssistant />
 </Suspense>
 </TabsContent>

 <TabsContent value="ai-insights" className="min-h-[600px]">
 <Suspense fallback={<AIToolsLoadingState icon={AI_TOOLS_TABS[2].icon!} message="Günlük insights yükleniyor..." />}>
 <AIInsightsDashboard />
 </Suspense>
 </TabsContent>

 <TabsContent value="gelismis-analiz" className="min-h-[600px]">
 <Suspense fallback={<AIToolsLoadingState icon={AI_TOOLS_TABS[3].icon!} message="Gelişmiş analiz yükleniyor..." />}>
 <AdvancedAIAnalysis />
 </Suspense>
 </TabsContent>

 <TabsContent value="gunluk-plan" className="min-h-[600px]">
 <Suspense fallback={<AIToolsLoadingState icon={AI_TOOLS_TABS[4].icon!} message="Günlük plan yükleniyor..." />}>
 <DailyActionPlan />
 </Suspense>
 </TabsContent>
 </motion.div>

 {/* Statistics Cards Section */}
 <div className="space-y-4">
 {/* This section replaces the old card grid */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              {
                title: "Toplam Öğrenci",
                value: stats.totalStudents,
                description: "Sistemde kayıtlı",
                icon: Brain,
                gradient: "from-blue-500 to-cyan-600",
                change: `${stats.totalStudents}`,
              },
              {
                title: "Yüksek Risk",
                value: stats.highRiskCount,
                description: "Yakın takip gerektiren",
                icon: TrendingUp,
                gradient: "from-purple-500 to-violet-600",
                change: stats.highRiskCount > 0 ? "Dikkat" : "İyi",
              },
              {
                title: "Aktif Uyarılar",
                value: stats.activeWarnings,
                description: "Güncel uyarı sayısı",
                icon: CheckCircle,
                gradient: "from-emerald-500 to-teal-600",
                change: `${stats.activeWarnings}`,
              },
              {
                title: "Bekleyen Öneriler",
                value: stats.pendingSuggestions,
                description: "AI önerisi bekliyor",
                icon: AlertTriangle,
                gradient: "from-amber-500 to-orange-600",
                change: stats.pendingSuggestions > 0 ? "Mevcut" : "-",
              },
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -3, scale: 1.01 }}
              >
                <Card className="relative overflow-hidden border hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 hover:opacity-5 transition-opacity`}></div>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start justify-between mb-2 md:mb-3">
                      <div className={`p-2 md:p-2.5 rounded-lg bg-gradient-to-br ${card.gradient} shadow-md`}>
                        <card.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-[10px] md:text-xs px-1.5 py-0.5">
                        {card.change}
                      </Badge>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{card.title}</p>
                      <p className="text-xl md:text-2xl font-bold tracking-tight">{card.value}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground truncate">{card.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
 </div>
 </Tabs>
 </div>
 </div>
 );
}
/**
 * Smart Academic Dashboard
 * Akademik performans özeti - mevcut akademik sekmelerini organize eder
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { STUDENT_ACADEMIC_TABS } from "@/config/tabs";
import StandardizedAcademicSection from "./StandardizedAcademicSection";
import StudentExamResultsSection from "./StudentExamResultsSection";
import CalismaProgramiSection from "./CalismaProgramiSection";
import SubjectTrackingSection from "./SubjectTrackingSection";
import AnketlerSection from "./AnketlerSection";

interface SmartAcademicDashboardProps {
 studentId: string;
 studentName?: string;
 onUpdate: () => void;
}

export default function SmartAcademicDashboard({
 studentId,
 studentName,
 onUpdate
}: SmartAcademicDashboardProps) {
 return (
 <div className="space-y-6">
 {/* Akademik Alt Sekmeler */}
 <Tabs defaultValue="performans" className="space-y-4">
 <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-white/80 backdrop-blur-sm border border-border/40 shadow-sm">
 {STUDENT_ACADEMIC_TABS.map((tabConfig) => {
 const Icon = tabConfig.icon;
 return (
 <TabsTrigger 
 key={tabConfig.value} 
 value={tabConfig.value}
 className="gap-2"
 >
 {Icon && <Icon className="h-4 w-4" />}
 <span className="hidden sm:inline">{tabConfig.label}</span>
 </TabsTrigger>
 );
 })}
 </TabsList>

 <TabsContent value="performans" className="space-y-4">
 <StandardizedAcademicSection
 studentId={studentId}
 onUpdate={onUpdate}
 />
 </TabsContent>

 <TabsContent value="sinavlar" className="space-y-4">
 <StudentExamResultsSection studentId={studentId} />
 </TabsContent>

 <TabsContent value="calisma-programi" className="space-y-4">
 <CalismaProgramiSection studentId={studentId} studentName={studentName} />
 </TabsContent>

 <TabsContent value="konu-takibi" className="space-y-4">
 <SubjectTrackingSection studentId={studentId} onUpdate={onUpdate} />
 </TabsContent>

 <TabsContent value="anketler" className="space-y-4">
 <AnketlerSection
 studentId={studentId}
 onUpdate={onUpdate}
 />
 </TabsContent>
 </Tabs>
 </div>
 );
}

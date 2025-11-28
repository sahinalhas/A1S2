/**
 * Akademik Veriler Sekmesi
 * Veri Kategorisi: Akademik Performans
 * İçerik: Notlar, sınavlar, devamsızlık, çalışma programı, akademik performans
 */

import SmartAcademicDashboard from "@/components/features/student-profile/sections/SmartAcademicDashboard";
import { motion } from "framer-motion";

interface AcademicTabProps {
  studentId: string;
  studentName?: string;
  onUpdate: () => void;
}

export function AcademicTab({ studentId, studentName, onUpdate }: AcademicTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <SmartAcademicDashboard studentId={studentId} studentName={studentName} onUpdate={onUpdate} />
    </motion.div>
  );
}

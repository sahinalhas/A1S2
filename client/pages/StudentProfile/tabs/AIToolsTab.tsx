import AIToolsHub from "@/components/features/student-profile/sections/AIToolsHub";

interface AIToolsTabProps {
  studentId: string;
  studentName: string;
  onUpdate: () => void;
}

export function AIToolsTab({
  studentId,
  studentName,
  onUpdate,
}: AIToolsTabProps) {
  return (
    <div className="space-y-4">
      <AIToolsHub
        studentId={studentId}
        studentName={studentName}
        onUpdate={onUpdate}
      />
    </div>
  );
}

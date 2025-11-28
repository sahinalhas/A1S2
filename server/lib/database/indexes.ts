import type Database from 'better-sqlite3';

export function setupDatabaseIndexes(db: Database.Database): void {
  db.exec('CREATE INDEX IF NOT EXISTS idx_students_class ON students(class)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_students_gender ON students(gender)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_students_class_gender ON students(class, gender)');
  
  db.exec('CREATE INDEX IF NOT EXISTS idx_meeting_notes_studentId ON meeting_notes(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_attendance_studentId ON attendance(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_academic_records_studentId ON academic_records(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_interventions_studentId ON interventions(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_student_documents_studentId ON student_documents(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_progress_studentId ON progress(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_academic_goals_studentId ON academic_goals(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_study_sessions_studentId ON study_sessions(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_notes_studentId ON notes(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_multiple_intelligence_studentId ON multiple_intelligence(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_learning_styles_studentId ON learning_styles(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_smart_goals_studentId ON smart_goals(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_coaching_recommendations_studentId ON coaching_recommendations(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_evaluations_360_studentId ON evaluations_360(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_achievements_studentId ON achievements(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_self_assessments_studentId ON self_assessments(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_parent_meetings_studentId ON parent_meetings(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_home_visits_studentId ON home_visits(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_family_participation_studentId ON family_participation(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_study_assignments_studentId ON study_assignments(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_weekly_slots_studentId ON weekly_slots(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_surveys_studentId ON surveys(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_survey_responses_studentId ON survey_responses(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_special_education_studentId ON special_education(studentId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_exam_results_studentId ON exam_results(studentId)');
  
  db.exec('CREATE INDEX IF NOT EXISTS idx_counseling_sessions_counselorId ON counseling_sessions(counselorId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_counseling_sessions_sessionDate ON counseling_sessions(sessionDate)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_counseling_sessions_completed ON counseling_sessions(completed)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_counseling_sessions_sessionType ON counseling_sessions(sessionType)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_counseling_session_students_sessionId ON counseling_session_students(sessionId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_counseling_session_students_studentId ON counseling_session_students(studentId)');
  
  db.exec('CREATE INDEX IF NOT EXISTS idx_survey_questions_templateId ON survey_questions(templateId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_survey_distributions_templateId ON survey_distributions(templateId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_survey_responses_distributionId ON survey_responses(distributionId)');
  
  db.exec('CREATE INDEX IF NOT EXISTS idx_topics_subjectId ON topics(subjectId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_progress_topicId ON progress(topicId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_study_sessions_topicId ON study_sessions(topicId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_study_assignments_topicId ON study_assignments(topicId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_weekly_slots_subjectId ON weekly_slots(subjectId)');
  
  db.exec('CREATE INDEX IF NOT EXISTS idx_meeting_notes_date ON meeting_notes(date)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_interventions_date ON interventions(date)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_exam_results_examDate ON exam_results(examDate)');
  
  db.exec('CREATE INDEX IF NOT EXISTS idx_progress_student_topic ON progress(studentId, topicId)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(studentId, date)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_exam_results_student_date ON exam_results(studentId, examDate)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_exam_results_type ON exam_results(examType)');
  
  db.exec('CREATE INDEX IF NOT EXISTS idx_meeting_notes_student_date ON meeting_notes(studentId, date)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_interventions_student_date ON interventions(studentId, date)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_parent_meetings_student_date ON parent_meetings(studentId, meetingDate)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_home_visits_student_date ON home_visits(studentId, date)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_study_assignments_student_due ON study_assignments(studentId, dueDate)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_study_sessions_student_date ON study_sessions(studentId, startTime)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_coaching_recommendations_student_date ON coaching_recommendations(studentId, created_at)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_family_participation_student_date ON family_participation(studentId, eventDate)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_self_assessments_student_date ON self_assessments(studentId, assessmentDate)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_evaluations_360_student_date ON evaluations_360(studentId, evaluationDate)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_multiple_intelligence_student_date ON multiple_intelligence(studentId, assessmentDate)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_learning_styles_student_date ON learning_styles(studentId, assessmentDate)');
  
  db.exec('CREATE INDEX IF NOT EXISTS idx_parent_meetings_date ON parent_meetings(meetingDate)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_home_visits_date ON home_visits(date)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_academic_goals_deadline ON academic_goals(deadline)');
}

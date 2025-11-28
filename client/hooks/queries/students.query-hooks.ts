import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/core/client';
import type { Student } from '@/lib/storage';

async function fetchStudents(): Promise<Student[]> {
 try {
 const response = await apiClient.get<Student[]>('/api/students', { 
 showErrorToast: false 
 });
 return response;
 } catch (error) {
 console.error('Error fetching students:', error);
 return [];
 }
}

export function useStudents() {
 const queryClient = useQueryClient();
 
 const { data: students = [], isLoading, error, refetch } = useQuery({
 queryKey: ['students'],
 queryFn: fetchStudents,
 staleTime: 5 * 60 * 1000, // 5 minutes
 gcTime: 10 * 60 * 1000, // 10 minutes
 });

 const invalidate = () => {
 queryClient.invalidateQueries({ queryKey: ['students'] });
 };

 return {
 students,
 isLoading,
 error,
 refetch,
 invalidate,
 };
}

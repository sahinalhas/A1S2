import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SurveyTemplate } from "@/lib/survey-types";
import { surveyService } from "@/services/survey.service";
import { useToast } from "@/hooks/utils/toast.utils";

export const SURVEY_QUERY_KEYS = {
 templates: ['survey-templates'] as const,
 template: (id: string) => ['survey-templates', id] as const,
 distributions: ['survey-distributions'] as const,
 distribution: (id: string) => ['survey-distributions', id] as const,
 questions: (templateId: string) => ['survey-questions', templateId] as const,
 responses: (distributionId?: string) => 
 distributionId ? ['survey-responses', distributionId] as const : ['survey-responses'] as const,
 analytics: (distributionId: string) => ['survey-analytics', distributionId] as const,
 statistics: (distributionId: string) => ['survey-statistics', distributionId] as const,
};

export function useSurveyTemplates() {
 return useQuery({
 queryKey: SURVEY_QUERY_KEYS.templates,
 queryFn: ({ signal }) => surveyService.getTemplates(signal),
 staleTime: 5 * 60 * 1000,
 gcTime: 10 * 60 * 1000,
 });
}

export function useCreateTemplate() {
 const { toast } = useToast();
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: (templateData: Partial<SurveyTemplate>) => 
 surveyService.createTemplate(templateData),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: SURVEY_QUERY_KEYS.templates });
 toast({
 title:"Başarılı",
 description:"Anket şablonu oluşturuldu",
 });
 },
 onError: (error: unknown) => {
 toast({
 title:"Hata",
 description: error instanceof Error ? error.message :"Anket şablonu oluşturulamadı",
 variant:"destructive",
 });
 },
 });
}

export function useUpdateTemplate() {
 const { toast } = useToast();
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: ({ id, data }: { id: string; data: Partial<SurveyTemplate> }) =>
 surveyService.updateTemplate(id, data),
 onSuccess: async () => {
 await queryClient.invalidateQueries({ queryKey: SURVEY_QUERY_KEYS.templates });
 toast({
 title:"Başarılı",
 description:"Anket şablonu güncellendi",
 });
 },
 onError: (error: unknown) => {
 toast({
 title:"Hata",
 description: error instanceof Error ? error.message :"Anket şablonu güncellenemedi",
 variant:"destructive",
 });
 },
 });
}

export function useDeleteTemplate() {
 const { toast } = useToast();
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: (templateId: string) => surveyService.deleteTemplate(templateId),
 onMutate: async (templateId) => {
 await queryClient.cancelQueries({ queryKey: SURVEY_QUERY_KEYS.templates });
 const previousTemplates = queryClient.getQueryData<SurveyTemplate[]>(SURVEY_QUERY_KEYS.templates);
 
 queryClient.setQueryData<SurveyTemplate[]>(
 SURVEY_QUERY_KEYS.templates,
 (old) => old?.filter((t) => t.id !== templateId) ?? []
 );

 return { previousTemplates };
 },
 onSuccess: () => {
 toast({
 title:"Başarılı",
 description:"Anket şablonu silindi",
 });
 },
 onError: (error: unknown, _, context) => {
 if (context?.previousTemplates) {
 queryClient.setQueryData(SURVEY_QUERY_KEYS.templates, context.previousTemplates);
 }
 toast({
 title:"Hata",
 description: error instanceof Error ? error.message :"Anket şablonu silinemedi",
 variant:"destructive",
 });
 },
 onSettled: () => {
 queryClient.invalidateQueries({ queryKey: SURVEY_QUERY_KEYS.templates });
 },
 });
}

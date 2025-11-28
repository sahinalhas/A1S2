import { ShieldAlert, Bot, Brain, Sparkles, CalendarDays } from "lucide-react";
import { TabConfig } from "./types";

/**
 * AI Araçları Sayfası Tab Yapılandırması
 */
export const AI_TOOLS_TABS: TabConfig[] = [
 {
 value:"risk",
 label:"Risk Takip",
 icon: ShieldAlert,
 description:"Risk analizi ve takip araçları",
 variant:"pills"
 },
 {
 value:"ai-asistan",
 label:"AI Asistan",
 icon: Bot,
 description:"Yapay zeka destekli asistan",
 variant:"pills"
 },
 {
 value:"ai-insights",
 label:"Günlük AI",
 icon: Brain,
 description:"Günlük yapay zeka içgörüleri",
 variant:"pills"
 },
 {
 value:"gelismis-analiz",
 label:"Derinlemesine",
 icon: Sparkles,
 description:"Gelişmiş analiz araçları",
 variant:"pills"
 },
 {
 value:"gunluk-plan",
 label:"Günlük Plan",
 icon: CalendarDays,
 description:"Günlük eylem planı",
 variant:"pills"
 }
];

export const VALID_AI_TOOLS_TABS = ["risk","ai-asistan","ai-insights","gelismis-analiz","gunluk-plan"] as const;

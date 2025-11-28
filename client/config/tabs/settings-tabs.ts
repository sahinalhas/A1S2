import { Globe, Bell, Sparkles, BookOpen, Shield, Archive, Target } from "lucide-react";
import { TabConfig } from "./types";

/**
 * Ayarlar Sayfası Tab Yapılandırması
 */
export const SETTINGS_TABS: TabConfig[] = [
 {
 value:"genel",
 label:"Genel",
 icon: Globe,
 description:"Genel uygulama ayarları"
 },
 {
 value:"bildirim",
 label:"Bildirimler",
 icon: Bell,
 description:"Bildirim tercihleri ve ayarları"
 },
 {
 value:"ai",
 label:"AI Yapılandırma",
 icon: Sparkles,
 description:"Yapay zeka entegrasyonu ve ayarları"
 },
 {
 value:"dersler",
 label:"Dersler & Konular",
 icon: BookOpen,
 description:"Ders ve konu yönetimi"
 },
 {
 value:"guvenlik",
 label:"Güvenlik",
 icon: Shield,
 description:"Güvenlik ve gizlilik ayarları"
 },
 {
 value:"yedekleme",
 label:"Yedekleme",
 icon: Archive,
 description:"Veri yedekleme ve geri yükleme"
 },
 {
 value:"rehberlik-standartlari",
 label:"Rehberlik Standartları",
 icon: Target,
 description:"Rehberlik standartları ve hedefler"
 }
];

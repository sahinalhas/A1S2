import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/endpoints/notifications.api";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/organisms/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/organisms/Table";
import {
 Bell,
 Mail,
 MessageSquare,
 RefreshCw,
 CheckCircle2,
 XCircle,
 Clock,
 TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale/tr";
import { toast } from "sonner";

export default function Notifications() {
 const queryClient = useQueryClient();
 const [selectedStatus, setSelectedStatus] = useState<string>("all");

 const { data: stats } = useQuery({
 queryKey: ["notification-stats"],
 queryFn: async () => {
 return await notificationsApi.getNotificationStats();
 },
 });

 const { data: notifications, isLoading } = useQuery({
 queryKey: ["notification-logs", selectedStatus],
 queryFn: async () => {
 return await notificationsApi.getNotificationLogs({
 status: selectedStatus ==="all" ? undefined : selectedStatus as any,
 limit: 100,
 });
 },
 });

 const retryMutation = useMutation({
 mutationFn: () => notificationsApi.retryFailed(),
 onSuccess: (result) => {
 toast.success(`${result.retried} bildirim yeniden gönderildi`);
 queryClient.invalidateQueries({ queryKey: ["notification-logs"] });
 queryClient.invalidateQueries({ queryKey: ["notification-stats"] });
 },
 });

 const getStatusIcon = (status: string) => {
 switch (status) {
 case"SENT":
 case"DELIVERED":
 return <CheckCircle2 className="h-4 w-4 text-green-500" />;
 case"FAILED":
 return <XCircle className="h-4 w-4 text-red-500" />;
 case"PENDING":
 return <Clock className="h-4 w-4 text-yellow-500" />;
 default:
 return <Bell className="h-4 w-4 text-gray-500" />;
 }
 };

 const getStatusBadge = (status: string) => {
 const variants: Record<string,"default" |"secondary" |"destructive" |"outline"> = {
 SENT:"secondary",
 DELIVERED:"default",
 FAILED:"destructive",
 PENDING:"outline",
 };
 return (
 <Badge variant={variants[status] ||"outline"}>
 {status ==="SENT" ?"Gönderildi" :
 status ==="DELIVERED" ?"Teslim Edildi" :
 status ==="FAILED" ?"Başarısız" :
 status ==="PENDING" ?"Bekliyor" : status}
 </Badge>
 );
 };

 const getPriorityColor = (priority: string) => {
 switch (priority) {
 case"URGENT":
 return"text-red-600";
 case"HIGH":
 return"text-orange-600";
 case"NORMAL":
 return"text-blue-600";
 case"LOW":
 return"text-gray-600";
 default:
 return"text-gray-600";
 }
 };

 return (
 <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold">Bildirim Yönetimi</h1>
 <p className="text-muted-foreground mt-2">
 Otomatik bildirimler, veli mesajları ve istatistikler
 </p>
 </div>
 <Button
 onClick={() => retryMutation.mutate()}
 disabled={retryMutation.isPending}
 variant="outline"
 >
 <RefreshCw className="h-4 w-4 mr-2" />
 Başarısızları Yeniden Gönder
 </Button>
 </div>

 {stats && (
 <div className="grid gap-4 md:grid-cols-4">
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">
 Toplam Bildirim
 </CardTitle>
 <Bell className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{stats.total}</div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">
 Gönderildi
 </CardTitle>
 <CheckCircle2 className="h-4 w-4 text-green-500" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{stats.sent}</div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">
 Başarısız
 </CardTitle>
 <XCircle className="h-4 w-4 text-red-500" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{stats.failed}</div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">
 Başarı Oranı
 </CardTitle>
 <TrendingUp className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">
 {stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0}%
 </div>
 </CardContent>
 </Card>
 </div>
 )}

 <Tabs defaultValue="all" onValueChange={setSelectedStatus}>
 <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white/80 backdrop-blur-sm border border-border/40 shadow-sm">
 <TabsTrigger value="all" className="gap-2">
 <Bell className="h-4 w-4" />
 <span className="hidden sm:inline">Tümü</span>
 </TabsTrigger>
 <TabsTrigger value="PENDING" className="gap-2">
 <RefreshCw className="h-4 w-4" />
 <span className="hidden sm:inline">Bekleyen</span>
 </TabsTrigger>
 <TabsTrigger value="SENT" className="gap-2">
 <Mail className="h-4 w-4" />
 <span className="hidden sm:inline">Gönderilen</span>
 </TabsTrigger>
 <TabsTrigger value="FAILED" className="gap-2">
 <MessageSquare className="h-4 w-4" />
 <span className="hidden sm:inline">Başarısız</span>
 </TabsTrigger>
 </TabsList>

 <TabsContent value={selectedStatus} className="mt-6">
 <Card>
 <CardHeader>
 <CardTitle>Bildirim Geçmişi</CardTitle>
 <CardDescription>
 Son gönderilen bildirimlerin detaylı listesi
 </CardDescription>
 </CardHeader>
 <CardContent>
 {isLoading ? (
 <div className="text-center py-8 text-muted-foreground">
 Yükleniyor...
 </div>
 ) : !notifications || notifications.length === 0 ? (
 <div className="text-center py-8 text-muted-foreground">
 Bildirim bulunamadı
 </div>
 ) : (
 <div className="overflow-x-auto">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Durum</TableHead>
 <TableHead>Alıcı</TableHead>
 <TableHead>Kanal</TableHead>
 <TableHead>Konu</TableHead>
 <TableHead>Öncelik</TableHead>
 <TableHead>Tarih</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {notifications.map((notification) => (
 <TableRow key={notification.id}>
 <TableCell>
 <div className="flex items-center gap-2">
 {getStatusIcon(notification.status)}
 {getStatusBadge(notification.status)}
 </div>
 </TableCell>
 <TableCell>
 <div className="flex flex-col">
 <span className="font-medium">
 {notification.recipientName || notification.recipientContact}
 </span>
 <span className="text-xs text-muted-foreground">
 {notification.recipientType ==="PARENT" ?"Veli" :
 notification.recipientType ==="TEACHER" ?"Öğretmen" :
 notification.recipientType ==="COUNSELOR" ?"Rehber" :"Admin"}
 </span>
 </div>
 </TableCell>
 <TableCell>
 {notification.notificationType ==="EMAIL" ? (
 <div className="flex items-center gap-2">
 <Mail className="h-4 w-4" />
 E-posta
 </div>
 ) : notification.notificationType ==="SMS" ? (
 <div className="flex items-center gap-2">
 <MessageSquare className="h-4 w-4" />
 SMS
 </div>
 ) : (
 <div className="flex items-center gap-2">
 <Bell className="h-4 w-4" />
 {notification.notificationType}
 </div>
 )}
 </TableCell>
 <TableCell>
 <div className="max-w-md">
 <div className="font-medium truncate">
 {notification.subject ||"Konu yok"}
 </div>
 <div className="text-xs text-muted-foreground truncate">
 {notification.message}
 </div>
 </div>
 </TableCell>
 <TableCell>
 <span className={getPriorityColor(notification.priority)}>
 {notification.priority ==="URGENT" ?"Acil" :
 notification.priority ==="HIGH" ?"Yüksek" :
 notification.priority ==="NORMAL" ?"Normal" :"Düşük"}
 </span>
 </TableCell>
 <TableCell className="text-sm text-muted-foreground">
 {formatDistanceToNow(new Date(notification.created_at), {
 addSuffix: true,
 locale: tr,
 })}
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 )}
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 );
}

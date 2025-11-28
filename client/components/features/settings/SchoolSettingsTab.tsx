import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth, School } from "@/lib/auth-context";
import { useSettingsTabDirty } from "@/pages/Settings";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/organisms/Dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/organisms/AlertDialog";
import { Building2, Edit2, Trash2, Star, Plus, Save, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface EditingSchool extends School {
  isEditing?: boolean;
}

export default function SchoolSettingsTab() {
  const { userSchools, loadUserSchools } = useAuth();
  const settingsContext = useSettingsTabDirty();
  const componentId = useMemo(() => `school-settings-${Date.now()}`, []);
  
  const [schools, setSchools] = useState<EditingSchool[]>(userSchools);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSchool, setEditingSchool] = useState<EditingSchool | null>(null);
  const [deletingSchoolId, setDeletingSchoolId] = useState<string | null>(null);
  const [showNewSchoolDialog, setShowNewSchoolDialog] = useState(false);
  const [newSchool, setNewSchool] = useState<Partial<School>>({
    name: "",
    code: "",
    address: "",
    phone: "",
    email: "",
    principal: "",
    website: "",
    socialMedia: "",
    viceEducationDirector: "",
  });
  const saveSettingsRef = useRef<() => Promise<void>>();

  useEffect(() => {
    setSchools(userSchools);
  }, [userSchools]);

  const handleEditSchool = async () => {
    if (!editingSchool) return;
    if (!editingSchool.name?.trim()) {
      toast.error("Okul adı gereklidir");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/schools/${editingSchool.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editingSchool.name,
          code: editingSchool.code,
          address: editingSchool.address,
          phone: editingSchool.phone,
          email: editingSchool.email,
          principal: editingSchool.principal,
          website: editingSchool.website,
          socialMedia: editingSchool.socialMedia,
          viceEducationDirector: editingSchool.viceEducationDirector,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Okul bilgileri güncellendi");
        await loadUserSchools();
        setEditingSchool(null);
      } else {
        toast.error(result.message || "Güncelleme başarısız");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/schools/${schoolId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Okul silindi");
        await loadUserSchools();
      } else {
        toast.error(result.message || "Silme başarısız");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setIsLoading(false);
      setDeletingSchoolId(null);
    }
  };

  const handleSetDefault = async (schoolId: string) => {
    try {
      const response = await fetch(`/api/schools/${schoolId}/set-default`, {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Varsayılan okul değiştirildi");
        await loadUserSchools();
      } else {
        toast.error(result.message || "Başarısız");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    }
  };

  const handleCreateSchool = async () => {
    if (!newSchool.name?.trim()) {
      toast.error("Okul adı gereklidir");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
        name: newSchool.name,
        code: newSchool.code,
        address: newSchool.address,
        phone: newSchool.phone,
        email: newSchool.email,
        principal: newSchool.principal,
        website: newSchool.website,
        socialMedia: newSchool.socialMedia,
        viceEducationDirector: newSchool.viceEducationDirector,
      }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Okul oluşturuldu");
        setShowNewSchoolDialog(false);
        setNewSchool({
          name: "",
          code: "",
          address: "",
          phone: "",
          email: "",
          principal: "",
          website: "",
          socialMedia: "",
          viceEducationDirector: "",
        });
        await loadUserSchools();
      } else {
        toast.error(result.message || "Oluşturma başarısız");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    saveSettingsRef.current = () => Promise.resolve();
  }, []);

  useEffect(() => {
    if (!settingsContext?.registerTabSubmit) return;
    settingsContext.registerTabSubmit(componentId, async () => {
      if (saveSettingsRef.current) {
        await saveSettingsRef.current();
      }
    });

    return () => {
      if (settingsContext?.unregisterTabSubmit) {
        settingsContext.unregisterTabSubmit(componentId);
      }
    };
  }, [componentId, settingsContext]);

  return (
    <div className="space-y-4">
      {schools.length === 0 ? (
        <Card className="border-muted">
          <CardContent className="pt-6 text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium mb-4">Henüz bir okulunuz yok</p>
            <Button onClick={() => setShowNewSchoolDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              İlk Okulu Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {schools.map((school, index) => (
              <motion.div
                key={school.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-muted hover:border-primary/50 transition-all">
                  <CardContent className="pt-6">
                    {editingSchool?.id === school.id ? (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Okul Adı *</Label>
                            <Input
                              value={editingSchool.name}
                              onChange={(e) =>
                                setEditingSchool({
                                  ...editingSchool,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Okul Kodu</Label>
                            <Input
                              value={editingSchool.code || ""}
                              onChange={(e) =>
                                setEditingSchool({
                                  ...editingSchool,
                                  code: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Adres</Label>
                            <Input
                              value={editingSchool.address || ""}
                              onChange={(e) =>
                                setEditingSchool({
                                  ...editingSchool,
                                  address: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Telefon</Label>
                            <Input
                              value={editingSchool.phone || ""}
                              onChange={(e) =>
                                setEditingSchool({
                                  ...editingSchool,
                                  phone: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>E-posta</Label>
                            <Input
                              type="email"
                              value={editingSchool.email || ""}
                              onChange={(e) =>
                                setEditingSchool({
                                  ...editingSchool,
                                  email: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Müdür Adı</Label>
                            <Input
                              value={editingSchool.principal || ""}
                              onChange={(e) =>
                                setEditingSchool({
                                  ...editingSchool,
                                  principal: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Web Sitesi</Label>
                            <Input
                              type="url"
                              placeholder="https://..."
                              value={editingSchool.website || ""}
                              onChange={(e) =>
                                setEditingSchool({
                                  ...editingSchool,
                                  website: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Sosyal Medya</Label>
                            <Input
                              placeholder="Instagram, Facebook vb."
                              value={editingSchool.socialMedia || ""}
                              onChange={(e) =>
                                setEditingSchool({
                                  ...editingSchool,
                                  socialMedia: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Müdür Yardımcısı</Label>
                            <Input
                              value={editingSchool.viceEducationDirector || ""}
                              onChange={(e) =>
                                setEditingSchool({
                                  ...editingSchool,
                                  viceEducationDirector: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            onClick={() => setEditingSchool(null)}
                            disabled={isLoading}
                            className="flex-1"
                          >
                            İptal
                          </Button>
                          <Button
                            onClick={handleEditSchool}
                            disabled={isLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Kaydediliyor
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Kaydet
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold text-lg">{school.name}</h3>
                              {school.isDefault && (
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              )}
                            </div>
                            {school.code && (
                              <p className="text-sm text-muted-foreground">Kod: {school.code}</p>
                            )}
                            {school.address && (
                              <p className="text-sm text-muted-foreground">Adres: {school.address}</p>
                            )}
                            {school.phone && (
                              <p className="text-sm text-muted-foreground">Telefon: {school.phone}</p>
                            )}
                            {school.email && (
                              <p className="text-sm text-muted-foreground">E-posta: {school.email}</p>
                            )}
                            {school.principal && (
                              <p className="text-sm text-muted-foreground">Müdür: {school.principal}</p>
                            )}
                            {school.viceEducationDirector && (
                              <p className="text-sm text-muted-foreground">Müdür Yardımcısı: {school.viceEducationDirector}</p>
                            )}
                            {school.website && (
                              <p className="text-sm text-muted-foreground">
                                Web: <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{school.website}</a>
                              </p>
                            )}
                            {school.socialMedia && (
                              <p className="text-sm text-muted-foreground">Sosyal Medya: {school.socialMedia}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          {!school.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(school.id)}
                              disabled={isLoading}
                              className="flex-1"
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Varsayılan Yap
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingSchool(school)}
                            disabled={isLoading}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeletingSchoolId(school.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowNewSchoolDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Okul Ekle
          </Button>
        </>
      )}

      {/* New School Dialog */}
      <Dialog open={showNewSchoolDialog} onOpenChange={setShowNewSchoolDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Okul Oluştur</DialogTitle>
            <DialogDescription>Yeni bir okul ekleyin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newSchoolName">Okul Adı *</Label>
              <Input
                id="newSchoolName"
                placeholder="Okul adını girin"
                value={newSchool.name || ""}
                onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newSchoolCode">Okul Kodu</Label>
              <Input
                id="newSchoolCode"
                placeholder="Okul kodunu girin"
                value={newSchool.code || ""}
                onChange={(e) => setNewSchool({ ...newSchool, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newSchoolAddress">Adres</Label>
              <Input
                id="newSchoolAddress"
                placeholder="Okul adresini girin"
                value={newSchool.address || ""}
                onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newSchoolPhone">Telefon</Label>
              <Input
                id="newSchoolPhone"
                placeholder="Okul telefonunu girin"
                value={newSchool.phone || ""}
                onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newSchoolEmail">E-posta</Label>
              <Input
                id="newSchoolEmail"
                type="email"
                placeholder="Okul e-postasını girin"
                value={newSchool.email || ""}
                onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newSchoolPrincipal">Müdür Adı</Label>
              <Input
                id="newSchoolPrincipal"
                placeholder="Müdür adını girin"
                value={newSchool.principal || ""}
                onChange={(e) => setNewSchool({ ...newSchool, principal: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newSchoolWebsite">Web Sitesi</Label>
              <Input
                id="newSchoolWebsite"
                type="url"
                placeholder="https://..."
                value={newSchool.website || ""}
                onChange={(e) => setNewSchool({ ...newSchool, website: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newSchoolSocialMedia">Sosyal Medya</Label>
              <Input
                id="newSchoolSocialMedia"
                placeholder="Instagram, Facebook vb."
                value={newSchool.socialMedia || ""}
                onChange={(e) => setNewSchool({ ...newSchool, socialMedia: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newSchoolViceDirector">Müdür Yardımcısı</Label>
              <Input
                id="newSchoolViceDirector"
                placeholder="Müdür yardımcısının adını girin"
                value={newSchool.viceEducationDirector || ""}
                onChange={(e) => setNewSchool({ ...newSchool, viceEducationDirector: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewSchoolDialog(false)}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button onClick={handleCreateSchool} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Oluşturuluyor
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Oluştur
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingSchoolId} onOpenChange={(open) => !open && setDeletingSchoolId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Okulu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu okulu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deletingSchoolId && handleDeleteSchool(deletingSchoolId)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Siliniyor
              </>
            ) : (
              "Sil"
            )}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

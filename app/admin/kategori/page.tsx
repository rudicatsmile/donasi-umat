"use client";

import * as React from "react";
import { FolderTree, Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Category } from "@/lib/dummy-data";
import { toast } from "sonner";
import {
  getCategoriesAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/app/actions/profile-and-category";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);

  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");

  const loadCategories = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getCategoriesAction();
      if (res.success && res.data) {
        setCategories(res.data);
      } else {
        toast.error(res.error || "Gagal memuat kategori dari database");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat memuat kategori");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      toast.error("Harap isi nama dan slug kategori!");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("slug", slug.trim());
      formData.append("description", description.trim());

      if (editingCategory) {
        const res = await updateCategoryAction(editingCategory.id, formData);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(res.message || "Kategori berhasil diperbarui!");
          setIsModalOpen(false);
          await loadCategories();
        }
      } else {
        const res = await createCategoryAction(formData);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(res.message || "Kategori baru berhasil ditambahkan!");
          setIsModalOpen(false);
          await loadCategories();
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan kategori");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (confirm(`Hapus kategori "${catName}"?`)) {
      try {
        const res = await deleteCategoryAction(id);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(`Kategori "${catName}" berhasil dihapus.`);
          await loadCategories();
        }
      } catch (err: any) {
        toast.error(err.message || "Gagal menghapus kategori");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
            Kelola Kategori Kampanye
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Master data kategori galang dana sosial dan filantropi langsung dari database Supabase.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 font-bold shadow-sm">
          <Plus className="h-4 w-4" />
          Tambah Kategori Baru
        </Button>
      </div>

      <Card className="shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kategori</TableHead>
              <TableHead>Slug URL</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Jumlah Kampanye</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-xs">Memuat data kategori dari Supabase...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <FolderTree className="h-8 w-8 text-slate-300" />
                    <p className="text-xs font-semibold">Belum ada kategori di database</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <p className="font-heading font-bold text-xs text-foreground">{cat.name}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">
                    {cat.slug}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                    {cat.description || "—"}
                  </TableCell>
                  <TableCell className="font-heading font-semibold text-xs text-foreground">
                    {cat.count} Kampanye
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(cat)}
                      className="h-8 w-8 p-0"
                      title="Edit Kategori"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* CRUD Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nama Kategori</label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingCategory) {
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }
                }}
                placeholder="Contoh: Bantuan Pangan"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Slug URL</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="bantuan-pangan"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Deskripsi Singkat</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Penjelasan sasaran program..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="font-bold gap-2">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingCategory ? "Perbarui Kategori" : "Simpan Kategori"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

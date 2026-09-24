"use client";

import * as React from "react";
import { Users, ShieldCheck, UserX, UserCheck, Search, Filter, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  getAdminUsersAction,
  toggleUserSuspensionAction,
  updateUserRoleAction,
  AdminUserItem,
} from "@/app/actions/profile-and-category";

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const loadUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminUsersAction();
      if (res.success) {
        setUsers(res.data);
      } else {
        toast.error(res.error || "Gagal memuat pengguna");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menghubungi database");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    return matchRole && matchSearch;
  });

  const toggleUserStatus = async (id: string, currentStatus: "active" | "suspended") => {
    setProcessingId(id);
    try {
      const res = await toggleUserSuspensionAction(id, currentStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === id
              ? {
                  ...u,
                  status: currentStatus === "active" ? "suspended" : "active",
                }
              : u
          )
        );
        toast.success(res.message || "Status akun pengguna berhasil diperbarui!");
      } else {
        toast.error(res.error || "Gagal memperbarui status akun");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "donor" | "fundraiser" | "admin") => {
    setProcessingId(userId);
    try {
      const res = await updateUserRoleAction(userId, newRole);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        toast.success(res.message);
      } else {
        toast.error(res.error || "Gagal mengubah peran");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
            Kelola Pengguna Platform
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Daftar akun donatur dan penggalang dana terdaftar, status verifikasi KTP, dan hak akses.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadUsers}
          disabled={isLoading}
          className="gap-2 text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Segarkan Data
        </Button>
      </div>

      <Card className="p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, email, atau nomor WA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
            <button
              onClick={() => setRoleFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                roleFilter === "all" ? "bg-primary text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Semua ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter("donor")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                roleFilter === "donor" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Donatur
            </button>
            <button
              onClick={() => setRoleFilter("fundraiser")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                roleFilter === "fundraiser" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Penggalang Dana
            </button>
            <button
              onClick={() => setRoleFilter("admin")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                roleFilter === "admin" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </Card>

      <Card className="shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Memuat data pengguna dari database...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Users className="h-10 w-10 text-muted-foreground mx-auto stroke-1" />
            <p className="font-bold text-sm text-foreground">Pengguna Tidak Ditemukan</p>
            <p className="text-xs text-muted-foreground">Tidak ada akun yang sesuai dengan filter atau kata kunci pencarian.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama & Email</TableHead>
                <TableHead>Nomor WhatsApp</TableHead>
                <TableHead>Peran (Role)</TableHead>
                <TableHead>Verifikasi KTP</TableHead>
                <TableHead>Status Akun</TableHead>
                <TableHead className="text-right">Aksi Moderasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => {
                const isItemProcessing = processingId === u.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="font-heading font-bold text-xs text-foreground">{u.name}</p>
                      <p className="text-[11px] text-muted-foreground">{u.email}</p>
                      <p className="text-[10px] text-slate-400">Bergabung: {u.joinedDate}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">
                      {u.phone}
                    </TableCell>
                    <TableCell>
                      <select
                        aria-label="Ubah Peran"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                        disabled={isItemProcessing}
                        className="text-xs font-semibold rounded-md border border-slate-200 px-2 py-1 bg-white text-slate-800 shadow-2xs focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="donor">Donor</option>
                        <option value="fundraiser">Fundraiser</option>
                        <option value="admin">Admin</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      {u.isVerified ? (
                        <Badge variant="success">Terverifikasi</Badge>
                      ) : (
                        <Badge variant="outline">Belum</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.status === "active" ? (
                        <Badge variant="success">Aktif</Badge>
                      ) : (
                        <Badge variant="destructive">Ditangguhkan</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={u.status === "active" ? "destructive" : "outline"}
                        disabled={isItemProcessing}
                        onClick={() => toggleUserStatus(u.id, u.status)}
                        className="text-xs"
                      >
                        {isItemProcessing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : u.status === "active" ? (
                          "Suspend"
                        ) : (
                          "Aktifkan"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

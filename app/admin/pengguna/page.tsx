"use client";

import * as React from "react";
import { Users, ShieldCheck, UserX, UserCheck, Search, Filter } from "lucide-react";
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

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "donor" | "fundraiser" | "admin";
  isVerified: boolean;
  status: "active" | "suspended";
  joinedDate: string;
}

const INITIAL_USERS: UserItem[] = [
  {
    id: "usr-1",
    name: "Dimas Nugraha",
    email: "dimas.nugraha@gmail.com",
    phone: "+6281234567890",
    role: "donor",
    isVerified: true,
    status: "active",
    joinedDate: "2026-01-15",
  },
  {
    id: "usr-2",
    name: "Ustadz H. Ahmad Syafi'i",
    email: "ahmad.syafii@sahabatinsan.id",
    phone: "+6281233445566",
    role: "fundraiser",
    isVerified: true,
    status: "active",
    joinedDate: "2026-02-10",
  },
  {
    id: "usr-3",
    name: "dr. Nurul Annisa",
    email: "nurul.annisa@dokterkeliling.org",
    phone: "+6281987654321",
    role: "fundraiser",
    isVerified: true,
    status: "active",
    joinedDate: "2026-03-01",
  },
  {
    id: "usr-4",
    name: "Fajar Pratama",
    email: "fajar.pratama@gmail.com",
    phone: "+6281765432109",
    role: "donor",
    isVerified: false,
    status: "suspended",
    joinedDate: "2026-04-12",
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<UserItem[]>(INITIAL_USERS);
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              status: u.status === "active" ? "suspended" : "active",
            }
          : u
      )
    );
    toast.success("Status akun pengguna berhasil diperbarui!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          Kelola Pengguna Platform
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Daftar akun donatur dan penggalang dana terdaftar, status verifikasi KTP, dan hak akses.
        </p>
      </div>

      <Card className="p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email pengguna..."
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
          </div>
        </div>
      </Card>

      <Card className="shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama & Email</TableHead>
              <TableHead>Nomor WhatsApp</TableHead>
              <TableHead>Peran (Role)</TableHead>
              <TableHead>Verifikasi KTP</TableHead>
              <TableHead>Status Akun</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <p className="font-heading font-bold text-xs text-foreground">{u.name}</p>
                  <p className="text-[11px] text-muted-foreground">{u.email}</p>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-600">
                  {u.phone}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {u.role}
                  </Badge>
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
                    onClick={() => toggleUserStatus(u.id)}
                    className="text-xs"
                  >
                    {u.status === "active" ? "Suspend" : "Aktifkan"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

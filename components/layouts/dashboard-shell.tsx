"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HandHeart,
  LayoutDashboard,
  ReceiptText,
  HeartHandshake,
  User,
  Bell,
  Sparkles,
  PlusCircle,
  FileCheck2,
  Wallet,
  ShieldCheck,
  CheckCircle,
  FolderTree,
  Users,
  ScrollText,
  Settings,
  ChevronDown,
  Menu,
  ArrowLeft,
  LogOut,
  ExternalLink,
  Sunrise,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardShellProps {
  children: React.ReactNode;
  activeRole: "donor" | "fundraiser" | "admin";
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function DashboardShell({ children, activeRole }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const donorNav: NavItem[] = [
    { title: "Ringkasan Dasbor", href: "/dashboard", icon: LayoutDashboard },
    { title: "Sedekah Subuh Rutin", href: "/dashboard/sedekah-subuh", icon: Sunrise, badge: "Berkah" },
    { title: "Riwayat Donasi", href: "/dashboard/riwayat-donasi", icon: ReceiptText },
    { title: "Doa & Pesan Saya", href: "/dashboard/doa-saya", icon: HeartHandshake },
    { title: "Notifikasi", href: "/dashboard/notifikasi", icon: Bell, badge: "2" },
    { title: "Profil Akun", href: "/dashboard/profil", icon: User },
  ];

  const fundraiserNav: NavItem[] = [
    { title: "Kampanye Saya", href: "/galang-dana/kampanye-saya", icon: LayoutDashboard },
    { title: "Buat Kampanye Baru", href: "/galang-dana/kampanye-baru", icon: PlusCircle },
    { title: "Riwayat Pencairan", href: "/galang-dana/riwayat-pencairan", icon: Wallet },
    { title: "Verifikasi Identitas", href: "/galang-dana/verifikasi-identitas", icon: FileCheck2 },
    { title: "Panduan Galang Dana", href: "/galang-dana", icon: ExternalLink },
  ];

  const adminNav: NavItem[] = [
    { title: "Ringkasan Platform", href: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Verifikasi Transaksi", href: "/admin/transaksi", icon: ReceiptText, badge: "2 Baru" },
    { title: "Verifikasi Identitas", href: "/admin/verifikasi-identitas", icon: ShieldCheck, badge: "1" },
    { title: "Moderasi Kampanye", href: "/admin/kampanye", icon: Sparkles },
    { title: "Pencairan Dana", href: "/admin/pencairan", icon: Wallet, badge: "1" },
    { title: "Laporan Transparansi", href: "/admin/laporan-transparansi", icon: FileCheck2 },
    { title: "Kelola Pengguna", href: "/admin/pengguna", icon: Users },
    { title: "Kelola Kategori", href: "/admin/kategori", icon: FolderTree },
    { title: "Jejak Audit Log", href: "/admin/audit-log", icon: ScrollText },
    { title: "Pengaturan Platform", href: "/admin/pengaturan", icon: Settings },
  ];

  const currentNav =
    activeRole === "admin"
      ? adminNav
      : activeRole === "fundraiser"
      ? fundraiserNav
      : donorNav;

  const roleMeta = {
    donor: {
      label: "Donatur",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      avatarName: "Dimas Nugraha",
      avatarEmail: "dimas.nugraha@gmail.com",
    },
    fundraiser: {
      label: "Penggalang Dana",
      color: "bg-sky-50 text-sky-700 border-sky-200",
      avatarName: "Ustadz H. Ahmad Syafi'i",
      avatarEmail: "ahmad.syafii@sahabatinsan.id",
    },
    admin: {
      label: "Administrator",
      color: "bg-amber-50 text-amber-700 border-amber-200",
      avatarName: "Admin Rizky",
      avatarEmail: "admin.rizky@donasiumat.id",
    },
  }[activeRole];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-white fixed inset-y-0 z-30">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
              <HandHeart className="h-5 w-5" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-foreground">
              Donasi<span className="text-primary">Umat</span>
            </span>
          </Link>
        </div>

        {/* Current Role Indicator */}
        <div className="p-4 mx-3 my-2 rounded-xl bg-slate-50 border border-slate-200/70">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Area Saat Ini
          </p>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`text-xs font-semibold ${roleMeta.color}`}>
              {roleMeta.label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-0.5">
                  Ganti
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs">Ganti Tampilan Role (Demo)</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="text-xs">Dasbor Donatur</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/galang-dana/kampanye-saya" className="text-xs">Dasbor Penggalang</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard" className="text-xs">Panel Admin</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:text-foreground hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Profile Bar */}
        <div className="p-4 border-t border-border bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {roleMeta.avatarName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                  {roleMeta.avatarName}
                </span>
                <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                  {roleMeta.avatarEmail}
                </span>
              </div>
            </div>
            <Link href="/" title="Kembali ke Beranda Publik">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 border-b border-border bg-white px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <SheetHeader className="p-4 border-b border-border text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                      <HandHeart className="h-4 w-4" />
                    </div>
                    <span>Donasi<span className="text-primary">Umat</span></span>
                  </SheetTitle>
                </SheetHeader>
                <div className="p-3 space-y-1">
                  {currentNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                          isActive
                            ? "bg-primary text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                  <div className="pt-4 border-t border-border mt-4">
                    <Link
                      href="/"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Kembali ke Website Publik
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Beranda
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/notifikasi">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 text-slate-500 hover:text-foreground">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 pl-2 py-1 rounded-full hover:bg-slate-50 transition-colors focus:outline-none">
                  <Avatar className="h-8 w-8 ring-1 ring-border">
                    <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-semibold">
                      {roleMeta.avatarName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block text-xs font-semibold text-foreground">
                    {roleMeta.avatarName}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-semibold text-foreground">{roleMeta.avatarName}</p>
                    <p className="text-[11px] text-muted-foreground">{roleMeta.avatarEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profil" className="text-xs">Profil Akun</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/notifikasi" className="text-xs">Notifikasi Sistem</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/" className="text-xs text-red-600 focus:text-red-600">
                    <LogOut className="h-3.5 w-3.5 mr-2" />
                    Keluar Sesi
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

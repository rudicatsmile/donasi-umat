"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Menu,
  Sparkles,
  ShieldCheck,
  User,
  LayoutDashboard,
  Search,
  HandHeart,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";

export function PublicNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Donasi", href: "/kampanye" },
    { name: "Sedekah Subuh", href: "/sedekah-subuh" },
    { name: "Kalkulator Zakat", href: "/zakat" },
    { name: "Cara Kerja", href: "/cara-kerja" },
    { name: "Tentang Kami", href: "/tentang" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-xs">
      <div className="container mx-auto flex h-18 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
            <HandHeart className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-xl font-extrabold tracking-tight text-foreground">
                Donasi<span className="text-primary">Umat</span>
              </span>
              <Badge variant="success" className="text-[10px] px-1.5 py-0 h-4">
                Amanah
              </Badge>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium -mt-1 hidden sm:block">
              Berbagi Mudah, Amanah Terjaga
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-foreground/80 hover:text-primary hover:bg-slate-50"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & Role Switcher */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Quick Demo Navigation Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
                Pilih Area / Role
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Pintas Area Aplikasi (Demo)</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="font-medium text-xs">Dasbor Donatur</p>
                    <p className="text-[10px] text-muted-foreground">Riwayat donasi & kuitansi</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/galang-dana/kampanye-saya" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-sky-600" />
                  <div>
                    <p className="font-medium text-xs">Dasbor Penggalang</p>
                    <p className="text-[10px] text-muted-foreground">Kelola kampanye & pencairan</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  <div>
                    <p className="font-medium text-xs">Panel Admin Utama</p>
                    <p className="text-[10px] text-muted-foreground">Verifikasi transfer & KYC</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/galang-dana">
            <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/5 hover:border-primary">
              Mulai Galang Dana
            </Button>
          </Link>

          <Link href="/login">
            <Button variant="default" className="shadow-sm">
              Masuk / Daftar
            </Button>
          </Link>
        </div>

        {/* Mobile Nav Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Buka Menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetHeader className="text-left pb-4 border-b border-border">
                <SheetTitle className="flex items-center gap-2 font-heading">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                    <HandHeart className="h-5 w-5" />
                  </div>
                  <span>Donasi<span className="text-primary">Umat</span></span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-1 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1">
                  Navigasi
                </p>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-foreground hover:bg-slate-100 hover:text-primary"
                  >
                    {link.name}
                  </Link>
                ))}

                <div className="my-3 border-t border-border" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1">
                  Akses Pengguna (Demo)
                </p>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg hover:bg-emerald-50 text-emerald-700"
                >
                  <User className="h-4 w-4" />
                  Dasbor Donatur
                </Link>
                <Link
                  href="/galang-dana/kampanye-saya"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg hover:bg-sky-50 text-sky-700"
                >
                  <Sparkles className="h-4 w-4" />
                  Area Penggalang Dana
                </Link>
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg hover:bg-amber-50 text-amber-700"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Portal Admin
                </Link>
              </div>

              <div className="pt-4 border-t border-border flex flex-col gap-2">
                <Link href="/galang-dana" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Mulai Galang Dana
                  </Button>
                </Link>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="default" className="w-full">
                    Masuk / Daftar
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

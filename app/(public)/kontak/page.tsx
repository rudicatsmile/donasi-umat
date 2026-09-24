"use client";

import * as React from "react";
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Harap lengkapi semua kolom yang wajib diisi!");
      return;
    }
    setSubmitted(true);
    toast.success("Pesan Anda telah berhasil dikirimkan ke Tim Layanan DonasiUmat!");
  };

  return (
    <div className="py-12 lg:py-20 space-y-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="default" className="text-xs">Layanan Sahabat Umat</Badge>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Hubungi Tim Layanan DonasiUmat
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Ada pertanyaan, pengaduan kampanye mencurigakan, atau kendala verifikasi bukti transfer? Kami siap membantu dengan sepenuh hati.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 space-y-4 shadow-xs">
              <h3 className="font-heading font-bold text-lg text-foreground">
                Kantor Pusat & Pengaduan
              </h3>
              <div className="space-y-4 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Alamat Kantor</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Gedung Menara Amanah Lt. 4, Jl. RS Fatmawati No. 88, Cilandak, Jakarta Selatan, DKI Jakarta 12430
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 text-primary flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">WhatsApp Resmi Layanan</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      +62 812-3456-7890 (Chat Only)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 text-primary flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Surel (Email)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      bantuan@donasiumat.id
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 text-primary flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Jam Operasional</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Senin – Jumat: 08:30 – 17:30 WIB <br />
                      Sabtu – Ahad: Siaga Darurat Bencana
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 space-y-2 text-xs text-emerald-800">
              <h4 className="font-heading font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                Kanal Pengaduan Anti-Penipuan
              </h4>
              <p className="leading-relaxed">
                Menemukan kampanye yang terindikasi fiktif atau mencurigakan? Laporkan segera disertai bukti tautan dan kronologi. Kami akan mengunci pencairan dana sementara investigasi berlangsung.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-8 shadow-xs">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="h-16 w-16 rounded-full bg-emerald-100 text-primary flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-foreground">
                    Pesan Anda Telah Diterima!
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Terima kasih telah menghubungi DonasiUmat. Tim layanan kami akan merespons pesan Anda dalam waktu maksimal 1x24 jam kerja.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>
                    Kirim Pesan Lainnya
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-heading font-bold text-xl text-foreground">
                    Kirim Pesan atau Pertanyaan
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Isi formulir di bawah ini dan kami akan membalas via email atau WhatsApp Anda.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Dimas Nugraha"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Alamat Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Nomor WhatsApp (+62)
                      </label>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="081234567890"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Kategori Pesan
                      </label>
                      <select
                        aria-label="Kategori Pesan"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full h-11 rounded-lg border border-border bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                      >
                        <option value="pertanyaan">Pertanyaan Umum</option>
                        <option value="kendala_transfer">Kendala Verifikasi Bukti Transfer</option>
                        <option value="bantuan_penggalang">Bantuan Pembuatan Kampanye</option>
                        <option value="pengaduan">Laporan Penyalahgunaan Kampanye</option>
                        <option value="kerjasama">Kerjasama CSR / Lembaga</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Isi Pesan <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Jelaskan pertanyaan atau kendala yang Anda alami secara rinci..."
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full font-bold shadow-md shadow-primary/20 gap-2">
                    <Send className="h-4 w-4" />
                    Kirim Pesan Sekarang
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

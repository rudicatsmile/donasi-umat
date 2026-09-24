"use client";

import * as React from "react";
import { FileCheck2, CheckCircle2, XCircle, Eye, Building, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { DUMMY_CAMPAIGNS, TransparencyReport } from "@/lib/dummy-data";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { toast } from "sonner";
import { approveTransparencyReportAction, rejectTransparencyReportAction } from "@/app/actions/disbursement-and-updates";

export default function AdminTransparencyPage() {
  const allReports: (TransparencyReport & { campaignTitle: string; campaignSlug: string })[] = [];
  DUMMY_CAMPAIGNS.forEach((c) => {
    (c.transparencyReports || []).forEach((r) => {
      allReports.push({
        ...r,
        campaignTitle: c.title,
        campaignSlug: c.slug,
      });
    });
  });

  const [reports, setReports] = React.useState(allReports);
  const [selectedReport, setSelectedReport] = React.useState<typeof allReports[0] | null>(null);

  const handleApprove = async (id: string) => {
    try {
      const res = await approveTransparencyReportAction(id);
      if (res.success) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "published", isApproved: true } : r))
        );
        setSelectedReport(null);
        toast.success(res.message);
      } else {
        toast.error(res.error || "Gagal menyetujui laporan");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          Moderasi Laporan Transparansi Penyaluran
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Tinjau nota belanja, kuitansi rumah sakit, dan dokumentasi foto penyerahan dana dari penggalang.
        </p>
      </div>

      <Card className="shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Laporan & Tanggal Penyaluran</TableHead>
              <TableHead>Kampanye</TableHead>
              <TableHead>Dana Digunakan</TableHead>
              <TableHead>Penerima Manfaat</TableHead>
              <TableHead>Status Moderasi</TableHead>
              <TableHead className="text-right">Aksi Review</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  <p className="font-heading font-bold text-xs text-foreground">{report.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Disalurkan: {formatDateIndo(report.disbursementDate)}
                  </p>
                </TableCell>
                <TableCell className="max-w-[220px]">
                  <p className="font-heading font-semibold text-xs text-foreground line-clamp-1">
                    {report.campaignTitle}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-heading font-black text-xs text-emerald-700 tabular-nums">
                    {formatRupiah(report.amountUsed)}
                  </p>
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  {report.beneficiaries || "-"}
                </TableCell>
                <TableCell>
                  {report.status === "published" && (
                    <Badge variant="success">Telah Publik</Badge>
                  )}
                  {report.status === "pending_review" && (
                    <Badge variant="accent">Menunggu Review</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedReport(report)}
                    className="gap-1.5 text-xs font-semibold"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Periksa Bukti
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tinjau Laporan Penyaluran Dana</DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-border text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Judul Laporan:</span>
                  <span className="font-bold text-foreground">{selectedReport.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dana Digunakan:</span>
                  <span className="font-heading font-bold text-emerald-700 tabular-nums">
                    {formatRupiah(selectedReport.amountUsed)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Deskripsi Pengeluaran:</span>
                  <p className="text-slate-700 mt-1 leading-relaxed">{selectedReport.description}</p>
                </div>
              </div>

              {selectedReport.photoUrls && selectedReport.photoUrls.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">Foto Dokumentasi & Kuitansi:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedReport.photoUrls.map((p, idx) => (
                      <img
                        key={idx}
                        src={p}
                        alt="Bukti Laporan"
                        className="rounded-lg border border-border h-40 w-full object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setSelectedReport(null)}>
                  Tutup
                </Button>
                <Button
                  onClick={() => handleApprove(selectedReport.id)}
                  className="font-bold gap-1"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Sahkan & Terbitkan Laporan
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

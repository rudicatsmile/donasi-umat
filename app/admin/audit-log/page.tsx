"use client";

import * as React from "react";
import {
  ScrollText,
  Search,
  Filter,
  ShieldCheck,
  Eye,
  Calendar,
  User,
  Activity,
  Terminal,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DUMMY_AUDIT_LOGS, AuditLog } from "@/lib/dummy-data";
import { formatDateIndo } from "@/lib/utils";

export default function AdminAuditLogPage() {
  const [logs, setLogs] = React.useState<AuditLog[]>(DUMMY_AUDIT_LOGS);
  const [filterAction, setFilterAction] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchAction = filterAction === "all" || log.action === filterAction;
    const matchSearch =
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.entityType.toLowerCase().includes(search.toLowerCase());
    return matchAction && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Jejak Audit Sistem (Audit Log)
            </h1>
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-xs">
              Immutable Trail
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Rekaman kronologis setiap aksi kritis pada platform (kampanye, donasi, pencairan, transparansi).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari deskripsi, aktor, atau entitas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
            <button
              onClick={() => setFilterAction("all")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filterAction === "all" ? "bg-primary text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Semua Aksi ({logs.length})
            </button>
            <button
              onClick={() => setFilterAction("verify")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filterAction === "verify" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Verify
            </button>
            <button
              onClick={() => setFilterAction("approve")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filterAction === "approve" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Approve
            </button>
            <button
              onClick={() => setFilterAction("create")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filterAction === "create" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Create
            </button>
          </div>
        </div>
      </Card>

      <Card className="shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu & IP Address</TableHead>
              <TableHead>Aktor (Pelaku)</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Entitas</TableHead>
              <TableHead>Deskripsi Kronologis</TableHead>
              <TableHead className="text-right">Inspeksi Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <p className="font-mono text-xs text-foreground font-semibold">
                    {new Date(log.createdAt).toLocaleTimeString("id-ID")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{formatDateIndo(log.createdAt)}</p>
                  <p className="font-mono text-[10px] text-slate-400 mt-0.5">{log.ipAddress}</p>
                </TableCell>
                <TableCell>
                  <p className="font-heading font-bold text-xs text-foreground">{log.actorName}</p>
                  <Badge variant="outline" className="text-[9px] uppercase mt-0.5">
                    {log.actorRole}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono font-bold">
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-600">
                  {log.entityType}
                </TableCell>
                <TableCell className="max-w-md text-xs text-slate-700 leading-relaxed">
                  {log.description}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedLog(log)}
                    className="gap-1 text-xs"
                  >
                    <Terminal className="h-3.5 w-3.5 text-primary" />
                    Inspect JSON
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* JSON Inspection Modal */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inspeksi Log Audit — {selectedLog?.action.toUpperCase()}</DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-border space-y-1">
                <p><strong>Aktor:</strong> {selectedLog.actorName} ({selectedLog.actorRole})</p>
                <p><strong>Waktu:</strong> {selectedLog.createdAt}</p>
                <p><strong>IP & User Agent:</strong> {selectedLog.ipAddress} • {selectedLog.userAgent}</p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-foreground">Snapshot Data Perubahan:</span>
                <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60">
                  {JSON.stringify(
                    {
                      auditId: selectedLog.id,
                      entityType: selectedLog.entityType,
                      entityId: selectedLog.entityId,
                      description: selectedLog.description,
                      metadata: {
                        securityVerified: true,
                        checksum: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                      },
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedLog(null)}>
                  Tutup
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

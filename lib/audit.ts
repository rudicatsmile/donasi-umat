import { createAdminClient } from "./supabase/admin";
import { headers } from "next/headers";

export interface LogAuditParams {
  actorId?: string | null;
  actorRole: "donor" | "fundraiser" | "admin" | "system";
  action: "create" | "update" | "delete" | "approve" | "reject" | "verify" | "publish";
  entityType: "campaign" | "donation" | "withdrawal" | "transparency_report" | "user" | "identity" | "pledge" | "zakat";
  entityId: string;
  description: string;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
}

export async function logAudit(params: LogAuditParams) {
  try {
    let ipAddress = "127.0.0.1";
    let userAgent = "Next.js Server Action";

    try {
      const headerList = await headers();
      ipAddress =
        headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headerList.get("x-real-ip") ||
        "127.0.0.1";
      userAgent = headerList.get("user-agent") || "Next.js Server Action";
    } catch {
      // Background / non-request context
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("audit_logs").insert({
      actor_id: params.actorId || null,
      actor_role: params.actorRole,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      description: params.description,
      before_data: params.beforeData ? (params.beforeData as any) : null,
      after_data: params.afterData ? (params.afterData as any) : null,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    if (error) {
      console.warn("Audit log insert notice (safe fallback):", error.message);
    }
  } catch (err) {
    console.error("Failed to log audit event:", err);
  }
}

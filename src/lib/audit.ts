import { prisma } from "@/lib/prisma";

type AuditLogDelegate = {
  create: (args: {
    data: {
      actorId: string | null;
      action: string;
      targetType: string | null;
      targetId: string | null;
      metadata: Record<string, unknown> | null;
    };
  }) => Promise<unknown>;
};

function getAuditLogDelegate(): AuditLogDelegate | null {
  const maybeDelegate = (prisma as unknown as Record<string, unknown>).auditLog;
  if (!maybeDelegate || typeof maybeDelegate !== "object") {
    return null;
  }

  return maybeDelegate as AuditLogDelegate;
}

export async function writeAuditLog(input: {
  actorId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  const auditLog = getAuditLogDelegate();
  if (!auditLog) return;

  await auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      metadata: input.metadata ?? null
    }
  });
}

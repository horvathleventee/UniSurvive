"use server";

import { ReportStatus, ReportTargetType, ModNotificationType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import type { ActionResult } from "@/types/actions";

async function requireModerator() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    return null;
  }

  return user;
}

export async function setReportStatusAction(values: {
  reportId: string;
  status: "OPEN" | "REVIEWED" | "RESOLVED";
}): Promise<ActionResult> {
  const user = await requireModerator();
  if (!user) return { success: false, message: "Ehhez moderátor jogosultság kell." };

  await prisma.report.update({
    where: { id: values.reportId },
    data: {
      status: values.status as ReportStatus,
      reviewedAt: values.status === "OPEN" ? null : new Date()
    }
  });

  await writeAuditLog({
    actorId: user.id,
    action: "REPORT_STATUS_UPDATED",
    targetType: "REPORT",
    targetId: values.reportId,
    metadata: { status: values.status }
  });

  revalidatePath("/admin/reports");
  revalidatePath("/admin/audit");
  return { success: true, message: "A jelentés állapota frissült." };
}

export async function hideReportedTargetAction(values: {
  reportId: string;
}): Promise<ActionResult> {
  const user = await requireModerator();
  if (!user) return { success: false, message: "Ehhez moderátor jogosultság kell." };

  const report = await prisma.report.findUnique({
    where: { id: values.reportId }
  });

  if (!report) {
    return { success: false, message: "Nem találom ezt a jelentést." };
  }

  if (report.targetType === ReportTargetType.REVIEW) {
    await prisma.subjectReview.update({ where: { id: report.targetId }, data: { isHidden: true } });
  } else if (report.targetType === ReportTargetType.NOTE_RESOURCE) {
    await prisma.noteResource.update({ where: { id: report.targetId }, data: { isHidden: true } });
  } else if (report.targetType === ReportTargetType.EXAM_TIP) {
    await prisma.examTip.update({ where: { id: report.targetId }, data: { isHidden: true } });
  } else if (report.targetType === ReportTargetType.COMMENT) {
    await prisma.comment.update({ where: { id: report.targetId }, data: { isHidden: true } });
  } else if (report.targetType === ReportTargetType.SUBJECT) {
    await prisma.subject.update({ where: { id: report.targetId }, data: { isHidden: true } });
  } else if (report.targetType === ReportTargetType.USER) {
    await prisma.user.update({ where: { id: report.targetId }, data: { isBanned: true } });
  }

  await prisma.report.update({
    where: { id: report.id },
    data: {
      status: ReportStatus.RESOLVED,
      reviewedAt: new Date()
    }
  });

  await writeAuditLog({
    actorId: user.id,
    action: "REPORTED_TARGET_HIDDEN",
    targetType: report.targetType,
    targetId: report.targetId,
    metadata: { reportId: report.id }
  });

  revalidatePath("/admin/reports");
  revalidatePath("/admin/audit");
  revalidatePath("/profile");

  return { success: true, message: "A jelentett elem moderálva lett." };
}

export async function unhideReportedTargetAction(values: {
  reportId: string;
}): Promise<ActionResult> {
  const user = await requireModerator();
  if (!user) return { success: false, message: "Ehhez moderátor jogosultság kell." };

  const report = await prisma.report.findUnique({ where: { id: values.reportId } });
  if (!report) return { success: false, message: "Nem találom ezt a jelentést." };

  if (report.targetType === ReportTargetType.REVIEW) {
    await prisma.subjectReview.update({ where: { id: report.targetId }, data: { isHidden: false } });
  } else if (report.targetType === ReportTargetType.NOTE_RESOURCE) {
    await prisma.noteResource.update({ where: { id: report.targetId }, data: { isHidden: false } });
  } else if (report.targetType === ReportTargetType.EXAM_TIP) {
    await prisma.examTip.update({ where: { id: report.targetId }, data: { isHidden: false } });
  } else if (report.targetType === ReportTargetType.COMMENT) {
    await prisma.comment.update({ where: { id: report.targetId }, data: { isHidden: false } });
  } else if (report.targetType === ReportTargetType.SUBJECT) {
    await prisma.subject.update({ where: { id: report.targetId }, data: { isHidden: false } });
  }

  await writeAuditLog({
    actorId: user.id,
    action: "REPORTED_TARGET_UNHIDDEN",
    targetType: report.targetType,
    targetId: report.targetId,
    metadata: { reportId: report.id }
  });

  revalidatePath("/admin/reports");
  return { success: true, message: "A tartalom visszaállítva (látható)." };
}

export async function tempBanUserAction(values: {
  userId: string;
  days: number;
}): Promise<ActionResult> {
  const mod = await requireModerator();
  if (!mod) return { success: false, message: "Ehhez moderátor jogosultság kell." };

  if (mod.id === values.userId) return { success: false, message: "Saját magadat nem tilthatod." };

  const bannedUntil = new Date();
  bannedUntil.setDate(bannedUntil.getDate() + values.days);

  await prisma.user.update({ where: { id: values.userId }, data: { bannedUntil } });

  await prisma.modNotification.create({
    data: {
      recipientId: values.userId,
      senderId: mod.id,
      type: ModNotificationType.BAN_NOTICE,
      message: `Fiókod ${values.days} napra korlátozva lett a közösségi irányelvek megsértése miatt. Feloldás: ${bannedUntil.toLocaleDateString("hu-HU")}.`,
    },
  });

  await writeAuditLog({
    actorId: mod.id,
    action: "USER_TEMP_BANNED",
    targetType: "USER",
    targetId: values.userId,
    metadata: { days: values.days, bannedUntil: bannedUntil.toISOString() }
  });

  revalidatePath("/admin/reports");
  return { success: true, message: `A felhasználó ${values.days} napra korlátozva.` };
}

export async function sendModWarningAction(values: {
  userId: string;
  message: string;
}): Promise<ActionResult> {
  const mod = await requireModerator();
  if (!mod) return { success: false, message: "Ehhez moderátor jogosultság kell." };

  await prisma.modNotification.create({
    data: {
      recipientId: values.userId,
      senderId: mod.id,
      type: ModNotificationType.WARNING,
      message: values.message || "Figyelem: tartalmad nem felelt meg a közösségi irányelveknek.",
    },
  });

  await writeAuditLog({
    actorId: mod.id,
    action: "USER_WARNING_SENT",
    targetType: "USER",
    targetId: values.userId,
    metadata: { message: values.message }
  });

  revalidatePath("/admin/reports");
  return { success: true, message: "Figyelmeztetés elküldve." };
}

export async function sendModMessageAction(values: {
  userId: string;
  message: string;
}): Promise<ActionResult> {
  const mod = await requireModerator();
  if (!mod) return { success: false, message: "Ehhez moderátor jogosultság kell." };

  if (!values.message.trim()) return { success: false, message: "Az üzenet nem lehet üres." };

  await prisma.modNotification.create({
    data: {
      recipientId: values.userId,
      senderId: mod.id,
      type: ModNotificationType.MOD_MESSAGE,
      message: values.message,
    },
  });

  await writeAuditLog({
    actorId: mod.id,
    action: "MOD_MESSAGE_SENT",
    targetType: "USER",
    targetId: values.userId,
    metadata: { message: values.message }
  });

  revalidatePath("/admin/reports");
  return { success: true, message: "Üzenet elküldve a felhasználónak." };
}

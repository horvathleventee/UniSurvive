"use server";

import { ReportStatus, ReportTargetType } from "@prisma/client";
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

"use server";

import { VoteTargetType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { bookmarkSchema, reportSchema, voteSchema } from "@/lib/validators";
import type { ActionResult } from "@/types/actions";

export async function toggleBookmarkAction(values: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "A mentéshez jelentkezz be." };

  const parsed = bookmarkSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Érvénytelen tárgy." };
  }

  const subject = await prisma.subject.findUnique({
    where: { id: parsed.data.subjectId },
    select: { id: true, slug: true }
  });

  if (!subject) {
    return { success: false, message: "Nem találom ezt a tárgyat." };
  }

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_subjectId: {
        userId: user.id,
        subjectId: subject.id
      }
    }
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
  } else {
    await prisma.bookmark.create({
      data: {
        userId: user.id,
        subjectId: subject.id
      }
    });
  }

  revalidatePath(`/subjects/${subject.slug}`);
  revalidatePath("/profile");

  return {
    success: true,
    message: existing ? "A könyvjelző törölve lett." : "A tárgy elmentve a könyvjelzők közé."
  };
}

export async function voteAction(values: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "A szavazáshoz jelentkezz be." };

  const parsed = voteSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Érvénytelen szavazat." };
  }

  const existing = await prisma.vote.findUnique({
    where: {
      userId_targetType_targetId: {
        userId: user.id,
        targetType: parsed.data.targetType,
        targetId: parsed.data.targetId
      }
    }
  });

  if (existing?.value === parsed.data.value) {
    await prisma.vote.delete({ where: { id: existing.id } });
  } else if (existing) {
    await prisma.vote.update({
      where: { id: existing.id },
      data: { value: parsed.data.value }
    });
  } else {
    await prisma.vote.create({
      data: {
        userId: user.id,
        targetType: parsed.data.targetType,
        targetId: parsed.data.targetId,
        value: parsed.data.value
      }
    });
  }

  const redirectPath = await resolveRevalidatePath(parsed.data.targetType, parsed.data.targetId);
  revalidatePath(redirectPath);

  return { success: true, message: "Szavazat mentve." };
}

export async function reportAction(values: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "A jelentéshez jelentkezz be." };

  const parsed = reportSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Érvénytelen jelentés." };
  }

  await prisma.report.create({
    data: {
      userId: user.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      reason: parsed.data.reason
    }
  });

  revalidatePath("/admin/reports");
  revalidatePath("/profile");

  return { success: true, message: "A jelentést elmentettem, bekerült a moderációs inboxba." };
}

async function resolveRevalidatePath(targetType: VoteTargetType, targetId: string) {
  if (targetType === "REVIEW") {
    const review = await prisma.subjectReview.findUnique({
      where: { id: targetId },
      include: { subject: true }
    });
    return review ? `/subjects/${review.subject.slug}` : "/";
  }

  if (targetType === "NOTE_RESOURCE") {
    const resource = await prisma.noteResource.findUnique({
      where: { id: targetId },
      include: { subject: true }
    });
    return resource ? `/subjects/${resource.subject.slug}` : "/";
  }

  if (targetType === "EXAM_TIP") {
    const tip = await prisma.examTip.findUnique({
      where: { id: targetId },
      include: { subject: true }
    });
    return tip ? `/subjects/${tip.subject.slug}` : "/";
  }

  const comment = await prisma.comment.findUnique({
    where: { id: targetId },
    include: {
      subject: true,
      review: {
        include: { subject: true }
      }
    }
  });

  return comment?.subject
    ? `/subjects/${comment.subject.slug}`
    : comment?.review
      ? `/subjects/${comment.review.subject.slug}`
      : "/";
}

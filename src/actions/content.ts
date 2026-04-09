"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { commentSchema, examTipSchema, resourceSchema, reviewSchema } from "@/lib/validators";
import type { ActionResult } from "@/types/actions";

async function requireUser() {
  return getCurrentUser();
}

export async function createReviewAction(values: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { success: false, message: "A funkcióhoz jelentkezz be." };

  const parsed = reviewSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Hibás értékelés." };
  }

  const subject = await prisma.subject.findUnique({
    where: { id: parsed.data.subjectId },
    select: { slug: true }
  });

  if (!subject) {
    return { success: false, message: "Nem találom ezt a tárgyat." };
  }

  await prisma.subjectReview.create({
    data: {
      ...parsed.data,
      teacherName: parsed.data.teacherName || null,
      semesterTaken: parsed.data.semesterTaken || null,
      userId: user.id
    }
  });

  revalidatePath(`/subjects/${subject.slug}`);
  revalidatePath("/profile");

  return { success: true, message: "A tapasztalat mentve lett." };
}

export async function createExamTipAction(values: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { success: false, message: "A funkcióhoz jelentkezz be." };

  const parsed = examTipSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Hibás tipp." };
  }

  const subject = await prisma.subject.findUnique({
    where: { id: parsed.data.subjectId },
    select: { slug: true }
  });

  if (!subject) {
    return { success: false, message: "Nem találom ezt a tárgyat." };
  }

  await prisma.examTip.create({
    data: {
      ...parsed.data,
      userId: user.id
    }
  });

  revalidatePath(`/subjects/${subject.slug}`);
  revalidatePath("/profile");

  return { success: true, message: "A ZH/vizsga tipp mentve lett." };
}

export async function createResourceAction(values: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { success: false, message: "A funkcióhoz jelentkezz be." };

  const parsed = resourceSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Hibás forrás." };
  }

  const subject = await prisma.subject.findUnique({
    where: { id: parsed.data.subjectId },
    select: { slug: true }
  });

  if (!subject) {
    return { success: false, message: "Nem találom ezt a tárgyat." };
  }

  await prisma.noteResource.create({
    data: {
      ...parsed.data,
      description: parsed.data.description || null,
      userId: user.id
    }
  });

  revalidatePath(`/subjects/${subject.slug}`);
  revalidatePath("/profile");

  return { success: true, message: "A forrás mentve lett." };
}

export async function createCommentAction(values: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { success: false, message: "A funkcióhoz jelentkezz be." };

  const parsed = commentSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Hibás komment." };
  }

  let path = "/profile";

  if (parsed.data.subjectId) {
    const subject = await prisma.subject.findUnique({
      where: { id: parsed.data.subjectId },
      select: { slug: true }
    });

    if (subject) {
      path = `/subjects/${subject.slug}`;
    }
  }

  await prisma.comment.create({
    data: {
      content: parsed.data.content,
      subjectId: parsed.data.subjectId ?? null,
      reviewId: parsed.data.reviewId ?? null,
      userId: user.id
    }
  });

  revalidatePath(path);

  return { success: true, message: "A komment kikerült." };
}

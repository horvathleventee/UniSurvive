"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import type { ActionResult } from "@/types/actions";

async function getOwnedSubject(subjectId: string) {
  return prisma.subject.findUnique({
    where: { id: subjectId },
    select: { id: true, programId: true }
  });
}

export async function setProgressAction(values: {
  subjectId: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "A haladás mentéséhez jelentkezz be." };

  const subject = await getOwnedSubject(values.subjectId);

  if (!subject) {
    return { success: false, message: "Nem találom ezt a tárgyat." };
  }

  const existing = (await prisma.userSubjectProgress.findUnique({
    where: {
      userId_subjectId: {
        userId: user.id,
        subjectId: values.subjectId
      }
    },
    select: {
      plannedSemester: true
    }
  })) as { plannedSemester?: number | null } | null;

  await prisma.userSubjectProgress.upsert({
    where: {
      userId_subjectId: {
        userId: user.id,
        subjectId: values.subjectId
      }
    },
    update: {
      status: values.status,
      plannedSemester: values.status === "COMPLETED" ? null : existing?.plannedSemester ?? null
    } as never,
    create: {
      userId: user.id,
      subjectId: values.subjectId,
      status: values.status,
      plannedSemester: null
    } as never
  });

  revalidatePath("/profile");
  revalidatePath("/profile/progress");

  return { success: true, message: "A haladás állapota frissült." };
}

export async function setPlannedSemesterAction(values: {
  subjectId: string;
  plannedSemester: number | null;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "A tervezéshez jelentkezz be." };

  const subject = await getOwnedSubject(values.subjectId);

  if (!subject) {
    return { success: false, message: "Nem találom ezt a tárgyat." };
  }

  if (values.plannedSemester !== null && (values.plannedSemester < 1 || values.plannedSemester > 12)) {
    return { success: false, message: "A célfélév 1 és 12 közötti szám lehet." };
  }

  await prisma.userSubjectProgress.upsert({
    where: {
      userId_subjectId: {
        userId: user.id,
        subjectId: values.subjectId
      }
    },
    update: {
      plannedSemester: values.plannedSemester
    } as never,
    create: {
      userId: user.id,
      subjectId: values.subjectId,
      status: "PLANNED",
      plannedSemester: values.plannedSemester
    } as never
  });

  revalidatePath("/profile");
  revalidatePath("/profile/progress");

  return {
    success: true,
    message: values.plannedSemester ? "A tárgy bekerült a kiválasztott félévtervbe." : "A tárgy kikerült a félévtervből."
  };
}

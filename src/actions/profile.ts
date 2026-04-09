"use server";

import { revalidatePath } from "next/cache";

import { hashPassword, verifyPassword } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { changePasswordSchema, profileSettingsSchema } from "@/lib/validators";
import type { ActionResult } from "@/types/actions";

export async function updateProfileAction(values: unknown): Promise<ActionResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, message: "A profil mentéséhez jelentkezz be." };
  }

  const parsed = profileSettingsSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Érvénytelen profiladatok." };
  }

  const username = parsed.data.username.trim().toLowerCase();
  const existingUser = await prisma.user.findFirst({
    where: {
      username,
      NOT: { id: currentUser.id }
    },
    select: { id: true }
  });

  if (existingUser) {
    return { success: false, message: "Ez a felhasználónév már foglalt." };
  }

  const programId: string | null = parsed.data.programId || null;
  let universityId: string | null = parsed.data.universityId || null;

  if (programId) {
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: { faculty: true }
    });

    if (!program) {
      return { success: false, message: "A kiválasztott szakot nem találtam." };
    }

    if (universityId && program.faculty.universityId !== universityId) {
      return { success: false, message: "A szak nem ehhez az egyetemhez tartozik." };
    }

    universityId = program.faculty.universityId;
  } else if (!universityId) {
    universityId = null;
  }

  await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      name: parsed.data.name.trim(),
      username,
      bio: parsed.data.bio?.trim() || null,
      image: parsed.data.image || null,
      universityId,
      programId
    }
  });

  await writeAuditLog({
    actorId: currentUser.id,
    action: "PROFILE_UPDATED",
    targetType: "USER",
    targetId: currentUser.id,
    metadata: {
      username,
      universityId,
      programId
    }
  });

  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  revalidatePath("/profile/progress");
  revalidatePath("/profile/sessions");

  return { success: true, message: "A profilbeállításokat elmentettem." };
}

export async function changePasswordAction(values: unknown): Promise<ActionResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, message: "A jelszó módosításához jelentkezz be." };
  }

  const parsed = changePasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Érvénytelen jelszóadatok." };
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { passwordHash: true }
  });

  if (!user || !verifyPassword(parsed.data.currentPassword, user.passwordHash)) {
    return { success: false, message: "A jelenlegi jelszó nem stimmel." };
  }

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return { success: false, message: "Az új jelszó legyen más, mint a mostani." };
  }

  await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      passwordHash: hashPassword(parsed.data.newPassword)
    }
  });

  await writeAuditLog({
    actorId: currentUser.id,
    action: "PASSWORD_CHANGED",
    targetType: "USER",
    targetId: currentUser.id
  });

  revalidatePath("/profile/settings");
  revalidatePath("/profile/sessions");

  return { success: true, message: "A jelszót sikeresen frissítettem." };
}

"use server";

import { revalidatePath } from "next/cache";

import { writeAuditLog } from "@/lib/audit";
import { getCurrentSessionToken, getCurrentUser, revokeOtherSessions, revokeSessionById } from "@/lib/session";
import type { ActionResult } from "@/types/actions";

export async function revokeSessionAction(values: { sessionId: string }): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "A session kezeléshez jelentkezz be." };
  }

  const result = await revokeSessionById(user.id, values.sessionId);

  if (!result.count) {
    return { success: false, message: "Nem találtam ezt a sessiont." };
  }

  await writeAuditLog({
    actorId: user.id,
    action: "SESSION_REVOKED",
    targetType: "SESSION",
    targetId: values.sessionId
  });

  revalidatePath("/profile/sessions");

  return { success: true, message: "A kiválasztott session kijelentkeztetve." };
}

export async function revokeOtherSessionsAction(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "A session kezeléshez jelentkezz be." };
  }

  const currentToken = await getCurrentSessionToken();
  const result = await revokeOtherSessions(user.id, currentToken);

  await writeAuditLog({
    actorId: user.id,
    action: "OTHER_SESSIONS_REVOKED",
    targetType: "SESSION",
    metadata: { revokedCount: result.count }
  });

  revalidatePath("/profile/sessions");

  return {
    success: true,
    message: result.count ? `${result.count} másik session kijelentkeztetve.` : "Nem volt másik aktív session."
  };
}

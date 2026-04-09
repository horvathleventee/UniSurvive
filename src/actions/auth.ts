"use server";

import { redirect } from "next/navigation";

import { authenticateUser, registerUser } from "@/lib/auth";
import { createSession, clearSession } from "@/lib/session";
import { buildRateLimitKey, clearRateLimit, consumeRateLimit, getRateLimitStatus, getRequestContext } from "@/lib/security";
import { loginSchema, registerSchema } from "@/lib/validators";
import type { ActionResult } from "@/types/actions";

function getRateLimitMessage(retryAfterSeconds: number) {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return `Túl sok próbálkozás érkezett. Próbáld újra körülbelül ${minutes} perc múlva.`;
}

export async function loginAction(values: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Hibás bejelentkezési adatok."
    };
  }

  const requestContext = await getRequestContext();
  const rateLimitKey = buildRateLimitKey("login", {
    email: parsed.data.email,
    ipAddress: requestContext.ipAddress
  });

  const rateLimitStatus = await getRateLimitStatus("login", rateLimitKey);
  if (!rateLimitStatus.allowed) {
    return {
      success: false,
      message: getRateLimitMessage(rateLimitStatus.retryAfterSeconds)
    };
  }

  const user = await authenticateUser(parsed.data.email, parsed.data.password);

  if (!user) {
    const consumed = await consumeRateLimit({
      scope: "login",
      key: rateLimitKey
    });

    return {
      success: false,
      message: consumed.allowed ? "Nem találtam ilyen felhasználót, vagy hibás a jelszó." : getRateLimitMessage(consumed.retryAfterSeconds)
    };
  }

  await clearRateLimit("login", rateLimitKey);
  await createSession(user.id);

  return {
    success: true,
    message: "Sikeres bejelentkezés."
  };
}

export async function registerAction(values: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Érvénytelen regisztrációs adatok."
    };
  }

  const user = await registerUser(parsed.data);

  if (!user) {
    return {
      success: false,
      message: "Ez az email vagy felhasználónév már foglalt."
    };
  }

  await createSession(user.id);

  return {
    success: true,
    message: "Sikeres regisztráció."
  };
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

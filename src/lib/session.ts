import { randomUUID } from "crypto";

import { addDays } from "date-fns";
import { cookies } from "next/headers";
import { cache } from "react";

import { prisma } from "@/lib/prisma";
import { cleanupSecurityState, getRequestContext } from "@/lib/security";

const SESSION_COOKIE = "unisurvive_session";
const SESSION_TTL_DAYS = 30;
const MAX_SESSIONS_PER_USER = 5;

function buildCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/"
  };
}

export async function getCurrentSessionToken() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function createSession(userId: string) {
  await cleanupSecurityState();

  const token = randomUUID();
  const expiresAt = addDays(new Date(), SESSION_TTL_DAYS);
  const { ipAddress, userAgent } = await getRequestContext();

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
      lastUsedAt: new Date(),
      ipAddress,
      userAgent
    }
  });

  const staleSessions = await prisma.session.findMany({
    where: { userId },
    orderBy: [{ lastUsedAt: "desc" }, { createdAt: "desc" }],
    skip: MAX_SESSIONS_PER_USER,
    select: { id: true }
  });

  if (staleSessions.length) {
    await prisma.session.deleteMany({
      where: {
        id: {
          in: staleSessions.map((session) => session.id)
        }
      }
    });
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, token, buildCookieOptions(expiresAt));
}

export async function clearSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { token }
    });
  }

  store.set(SESSION_COOKIE, "", buildCookieOptions(new Date(0)));
}

export async function revokeSessionById(userId: string, sessionId: string) {
  return prisma.session.deleteMany({
    where: {
      id: sessionId,
      userId
    }
  });
}

export async function revokeOtherSessions(userId: string, currentToken: string | null) {
  return prisma.session.deleteMany({
    where: {
      userId,
      ...(currentToken ? { token: { not: currentToken } } : {})
    }
  });
}

export const getCurrentUser = cache(async () => {
  const token = await getCurrentSessionToken();

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          university: true,
          program: true
        }
      }
    }
  });

  if (!session || session.expiresAt < new Date() || session.user.isBanned) {
    await prisma.session.deleteMany({
      where: { token }
    });
    return null;
  }

  const lastSeenAt = session.lastUsedAt ?? session.createdAt;

  if (Date.now() - lastSeenAt.getTime() > 10 * 60 * 1000) {
    await prisma.session.update({
      where: { id: session.id },
      data: {
        lastUsedAt: new Date()
      }
    });
  }

  return session.user;
});

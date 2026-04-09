import { addMilliseconds, differenceInSeconds } from "date-fns";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";

type RateLimitScope = "login" | "avatar-upload";

type RateLimitConfig = {
  limit: number;
  windowMs: number;
  blockMs: number;
};

type RateLimitStatus = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const RATE_LIMITS: Record<RateLimitScope, RateLimitConfig> = {
  login: {
    limit: 5,
    windowMs: 15 * 60 * 1000,
    blockMs: 15 * 60 * 1000
  },
  "avatar-upload": {
    limit: 8,
    windowMs: 15 * 60 * 1000,
    blockMs: 20 * 60 * 1000
  }
};

function getWindowRetrySeconds(until: Date) {
  return Math.max(1, differenceInSeconds(until, new Date()));
}

export async function getRequestContext() {
  const store = await headers();
  const forwardedFor = store.get("x-forwarded-for");
  const realIp = store.get("x-real-ip");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
  const userAgent = store.get("user-agent")?.slice(0, 255) || null;

  return { ipAddress, userAgent };
}

export function buildRateLimitKey(scope: RateLimitScope, values: { email?: string; ipAddress?: string; userId?: string }) {
  if (scope === "login") {
    return `email:${values.email?.trim().toLowerCase() ?? "unknown"}|ip:${values.ipAddress ?? "unknown"}`;
  }

  return `user:${values.userId ?? "anonymous"}|ip:${values.ipAddress ?? "unknown"}`;
}

export async function getRateLimitStatus(scope: RateLimitScope, key: string): Promise<RateLimitStatus> {
  const config = RATE_LIMITS[scope];
  const now = new Date();
  const bucket = await prisma.rateLimitBucket.findUnique({
    where: {
      scope_key: {
        scope,
        key
      }
    }
  });

  if (!bucket) {
    return {
      allowed: true,
      remaining: config.limit,
      retryAfterSeconds: 0
    };
  }

  if (bucket.blockedUntil && bucket.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: getWindowRetrySeconds(bucket.blockedUntil)
    };
  }

  if (now.getTime() - bucket.windowStart.getTime() >= config.windowMs) {
    return {
      allowed: true,
      remaining: config.limit,
      retryAfterSeconds: 0
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, config.limit - bucket.hits),
    retryAfterSeconds: 0
  };
}

export async function consumeRateLimit(options: {
  scope: RateLimitScope;
  key: string;
  userId?: string | null;
}): Promise<RateLimitStatus> {
  const { scope, key, userId } = options;
  const config = RATE_LIMITS[scope];
  const now = new Date();
  const bucket = await prisma.rateLimitBucket.findUnique({
    where: {
      scope_key: {
        scope,
        key
      }
    }
  });

  if (!bucket) {
    await prisma.rateLimitBucket.create({
      data: {
        scope,
        key,
        hits: 1,
        windowStart: now,
        blockedUntil: null,
        userId: userId ?? null
      }
    });

    return {
      allowed: true,
      remaining: config.limit - 1,
      retryAfterSeconds: 0
    };
  }

  if (bucket.blockedUntil && bucket.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: getWindowRetrySeconds(bucket.blockedUntil)
    };
  }

  const isNewWindow = now.getTime() - bucket.windowStart.getTime() >= config.windowMs;
  const hits = isNewWindow ? 1 : bucket.hits + 1;
  const blockedUntil = hits >= config.limit ? addMilliseconds(now, config.blockMs) : null;

  await prisma.rateLimitBucket.update({
    where: { id: bucket.id },
    data: {
      hits,
      windowStart: isNewWindow ? now : bucket.windowStart,
      blockedUntil,
      userId: userId ?? bucket.userId
    }
  });

  if (blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: getWindowRetrySeconds(blockedUntil)
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, config.limit - hits),
    retryAfterSeconds: 0
  };
}

export async function clearRateLimit(scope: RateLimitScope, key: string) {
  await prisma.rateLimitBucket.deleteMany({
    where: {
      scope,
      key
    }
  });
}

export async function cleanupSecurityState() {
  const staleBucketCutoff = addMilliseconds(new Date(), -(24 * 60 * 60 * 1000));

  await Promise.all([
    prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    }),
    prisma.rateLimitBucket.deleteMany({
      where: {
        updatedAt: {
          lt: staleBucketCutoff
        }
      }
    })
  ]);
}

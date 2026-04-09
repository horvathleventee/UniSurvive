import { compareSync, hashSync } from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function registerUser(input: {
  name: string;
  username: string;
  email: string;
  password: string;
}) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { username: input.username }]
    }
  });

  if (existingUser) {
    return null;
  }

  return prisma.user.create({
    data: {
      name: input.name,
      username: input.username,
      email: input.email,
      passwordHash: hashPassword(input.password)
    }
  });
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return user;
}

export function verifyPassword(password: string, passwordHash: string) {
  return compareSync(password, passwordHash);
}

export function hashPassword(password: string) {
  return hashSync(password, 10);
}

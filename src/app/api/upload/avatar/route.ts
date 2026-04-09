import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { buildRateLimitKey, consumeRateLimit, getRateLimitStatus, getRequestContext } from "@/lib/security";
import { getCurrentUser } from "@/lib/session";

const mimeToExtension: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif"
};

const allowedMimeTypes = new Set(Object.keys(mimeToExtension));
const maxFileSize = 4 * 1024 * 1024;

function getRateLimitMessage(retryAfterSeconds: number) {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return `Túl sok avatar feltöltés érkezett. Próbáld újra körülbelül ${minutes} perc múlva.`;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "A feltöltéshez jelentkezz be." }, { status: 401 });
  }

  const requestContext = await getRequestContext();
  const rateLimitKey = buildRateLimitKey("avatar-upload", {
    userId: user.id,
    ipAddress: requestContext.ipAddress
  });

  const rateLimitStatus = await getRateLimitStatus("avatar-upload", rateLimitKey);
  if (!rateLimitStatus.allowed) {
    return NextResponse.json({ message: getRateLimitMessage(rateLimitStatus.retryAfterSeconds) }, { status: 429 });
  }

  const consumed = await consumeRateLimit({
    scope: "avatar-upload",
    key: rateLimitKey,
    userId: user.id
  });

  if (!consumed.allowed) {
    return NextResponse.json({ message: getRateLimitMessage(consumed.retryAfterSeconds) }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Nem kaptam képfájlt." }, { status: 400 });
  }

  if (!allowedMimeTypes.has(file.type)) {
    return NextResponse.json({ message: "Csak JPG, PNG, WEBP vagy GIF képet tudsz feltölteni." }, { status: 400 });
  }

  if (file.size > maxFileSize) {
    return NextResponse.json({ message: "A kép legfeljebb 4 MB lehet." }, { status: 400 });
  }

  const extension = mimeToExtension[file.type];
  const fileName = `${user.id}-${randomUUID()}.${extension}`;
  const uploadDirectory = path.join(process.cwd(), "public", "uploads", "avatars");
  const filePath = path.join(uploadDirectory, fileName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(filePath, fileBuffer);

  return NextResponse.json({
    url: `/uploads/avatars/${fileName}`
  });
}

import path from "path";
import { promises as fs } from "fs";
import prisma from "@/lib/prisma";
const MAX_BYTES = 10 * 1024 * 1024;
export async function ownsScoringAudio(userId: string, url: string): Promise<boolean> {
  return Boolean(await prisma.auditLog.findFirst({ where: {
      userId, action: "AUDIO_UPLOADED", metadata: {
        path: ["url"], equals: url
      }
    } }));
}
export async function readScoringAudio(url: string): Promise<{
  data: string;
  mimeType: string;
}> {
  let buffer: Buffer;
  if (url.startsWith("/uploads/audio/")) {
    const root = await fs.realpath(path.join(process.cwd(), "public", "uploads", "audio"));
    const target = await fs.realpath(path.resolve(process.cwd(), "public", "." + url));
    const relative = path.relative(root, target);
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative))
      throw new Error("Audio path denied");
    const stat = await fs.stat(target);
    if (!stat.isFile() || stat.size > MAX_BYTES)
      throw new Error("Invalid audio size");
    buffer = await fs.readFile(target);
  }
  else {
    const base = process.env.R2_PUBLIC_URL || process.env.AWS_S3_PUBLIC_URL;
    if (!base)
      throw new Error("Cloud audio not configured");
    const allowed = new URL(base.replace(/\/$/, "") + "/audio/");
    const target = new URL(url);
    if (target.protocol !== "https:" || target.origin !== allowed.origin || !target.pathname.startsWith(allowed.pathname) || target.username || target.password || target.search || target.hash)
      throw new Error("Audio URL denied");
    const response = await fetch(target, {
      redirect: "error", signal: AbortSignal.timeout(15000)
    });
    if (!response.ok || !response.body)
      throw new Error("Audio unavailable");
    if (Number(response.headers.get("content-length")) > MAX_BYTES) {
      await response.body.cancel();
      throw new Error("Audio too large");
    }
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done)
          break;
        size += value.length;
        if (size > MAX_BYTES)
          throw new Error("Audio too large");
        chunks.push(value);
      }
    }
    finally {
      await reader.cancel();
    }
    buffer = Buffer.concat(chunks);
  }
  if (!buffer.length || buffer.length > MAX_BYTES)
    throw new Error("Invalid audio size");
  const extension = path.extname(new URL(url, "https://local.invalid").pathname).toLowerCase();
  const types: Record<string, string> = {
    ".webm": "audio/webm", ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4", ".ogg": "audio/ogg", ".aac": "audio/aac"
  };
  if (!types[extension])
    throw new Error("Invalid audio format");
  return {
    data: buffer.toString("base64"), mimeType: types[extension]
  };
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUserFromRequest } from "@/lib/auth";
export async function GET(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const userId = request.nextUrl.searchParams.get("userId");
  const [writing, speaking] = await Promise.all([
    prisma.writingSubmission.findMany({
      where: {
        ...(userId ? { userId } : {}), status: "FAILED"
      }, include: {
        user: { select: { fullName: true } }, prompt: { select: { title: true } }
      }, orderBy: { submittedAt: "desc" }, take: 50
    }),
    prisma.speakingSession.findMany({
      where: {
        ...(userId ? { userId } : {}), status: "FAILED"
      }, include: {
        user: { select: { fullName: true } }, scenario: { select: { title: true } }
      }, orderBy: { startedAt: "desc" }, take: 50
    }),
  ]);
  return NextResponse.json({ rows: [...writing.map(row => ({
        id: row.id, resourceType: "WRITING", title: row.user.fullName + " — " + row.prompt.title
      })), ...speaking.map(row => ({
        id: row.id, resourceType: "SPEAKING", title: row.user.fullName + " — " + row.scenario.title
      }))] });
}

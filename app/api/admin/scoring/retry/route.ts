import { NextRequest, NextResponse, after } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { enqueueAIScoring, type AIScoringJobData } from "@/lib/queue";
import { runLocalScoring, markScoringFailed } from "@/lib/ai-scoring-processor";
export const dynamic = "force-dynamic";
const input = z.object({
  resourceType: z.enum(["TEST", "WRITING", "SPEAKING"]), resourceId: z.string().min(1)
});
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" ? value as Record<string, unknown> : {};
export async function POST(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid retry request" }, { status: 400 });
  const { resourceType, resourceId } = parsed.data;
  let job: AIScoringJobData | undefined;
  try {
    const claimed = await prisma.$transaction(async (tx) => {
      let count: number;
      if (resourceType === "TEST") {
        count = (await tx.testAttempt.updateMany({
          where: {
            id: resourceId, status: "FAILED"
          }, data: {
            status: "PROCESSING", completedAt: null
          }
        })).count;
        job = {
          type: "TEST_SCORING", testAttemptId: resourceId
        };
      }
      else if (resourceType === "WRITING") {
        const row = await tx.writingSubmission.findUnique({
          where: { id: resourceId }, include: { prompt: true }
        });
        if (!row || row.status !== "FAILED")
          return false;
        const context = object(object(row.aiFeedbackJson).scoringContext);
        job = {
          type: "WRITING_SCORING", submissionId: resourceId, responseText: row.responseText, promptText: typeof context.promptText === "string" ? context.promptText : row.prompt.promptText, rubric: "rubric" in context ? context.rubric : row.prompt.rubric
        };
        count = (await tx.writingSubmission.updateMany({
          where: {
            id: resourceId, status: "FAILED"
          }, data: {
            status: "PROCESSING", completedAt: null
          }
        })).count;
      }
      else {
        const row = await tx.speakingSession.findUnique({
          where: { id: resourceId }, include: { scenario: true }
        });
        if (!row || row.status !== "FAILED")
          return false;
        const context = object(object(row.aiFeedbackJson).scoringContext);
        job = {
          type: "SPEAKING_SCORING", sessionId: resourceId, transcriptText: row.transcriptText || "", audioUrl: row.audioUrl || undefined, scenarioTitle: typeof context.scenarioTitle === "string" ? context.scenarioTitle : row.scenario.title, scenarioDescription: typeof context.scenarioDescription === "string" ? context.scenarioDescription : row.scenario.description, rubric: "rubric" in context ? context.rubric : row.scenario.rubric
        };
        count = (await tx.speakingSession.updateMany({
          where: {
            id: resourceId, status: "FAILED"
          }, data: {
            status: "PROCESSING", completedAt: null
          }
        })).count;
      }
      if (count !== 1)
        return false;
      await tx.auditLog.create({ data: {
          userId: user.id, action: "SCORING_RETRIED", resource: resourceType, metadata: { resourceId }
        } });
      return true;
    });
    if (!claimed || !job)
      return NextResponse.json({ error: "Penilaian sedang berjalan atau status tidak dapat diulang." }, { status: 409 });
    const data = job;
    try {
      await enqueueAIScoring(data, async () => {
        after(() => runLocalScoring(data));
      });
    }
    catch (error) {
      await markScoringFailed(data);
      throw error;
    }
    return NextResponse.json({
      status: "PROCESSING", resourceId
    }, { status: 202 });
  }
  catch (error) {
    console.error("Retry scoring failed", error);
    return NextResponse.json({ error: "Gagal menjadwalkan penilaian ulang." }, { status: 500 });
  }
}

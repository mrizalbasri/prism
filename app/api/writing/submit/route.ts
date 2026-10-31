export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse, after } from 'next/server';
import { ResponseStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';
import { runLocalScoring, markScoringFailed } from '@/lib/ai-scoring-processor';
import { enqueueAIScoring } from '@/lib/queue';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'STUDENT' || !user.hasModuleAccess) {
      return NextResponse.json({ error: 'Module access required' }, { status: 403 });
    }

    // Check daily submission limit (max 3 submissions per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailySubmissionsCount = await prisma.writingSubmission.count({
      where: {
        userId: user.id,
        submittedAt: {
          gte: today,
        },
      },
    });

    if (dailySubmissionsCount >= 3) {
      return NextResponse.json(
        { error: 'Batas limit harian tercapai. Anda hanya diperbolehkan mengirimkan latihan menulis 3 kali per hari untuk menghemat penggunaan API AI.' },
        { status: 429 }
      );
    }

    // Rate limit: mohon tunggu 30 detik di antara submisi
    const lastSubmission = await prisma.writingSubmission.findFirst({
      where: { userId: user.id },
      orderBy: { submittedAt: 'desc' },
    });

    if (lastSubmission && Date.now() - new Date(lastSubmission.submittedAt).getTime() < 30 * 1000) {
      return NextResponse.json(
        { error: 'Mohon tunggu 30 detik sebelum mengirimkan latihan menulis lagi.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { promptId, essay: responseText } = body;

    if (typeof promptId !== 'string' || typeof responseText !== 'string' || !responseText.trim()) {
      return NextResponse.json(
        { error: 'promptId and essay are required' },
        { status: 400 }
      );
    }

    // Get prompt
    const prompt = await prisma.writingPrompt.findUnique({
      where: { id: promptId },
    });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Calculate word count
    const wordCount = responseText.trim().split(/\s+/).filter((w: string) => w.length > 0).length;

    // Create submission
    const submission = await prisma.writingSubmission.create({
      data: {
        userId: user.id,
        promptId,
        responseText,
        wordCount,
        aiFeedbackJson: { scoringContext: { promptText: prompt.promptText, rubric: prompt.rubric } },
        status: ResponseStatus.PENDING,
      },
    });

    // Create learning session
    await prisma.learningSession.create({
      data: {
        userId: user.id,
        sectionType: 'writing',
        durationSec: 0, // Will be updated when scoring completes
        completedAt: new Date(),
      },
    });

    await createAuditLog(
      user.id,
      'WRITING_SUBMITTED',
      'WritingSubmission',
      submission.id,
      { promptId, wordCount }
    );

    // Process AI scoring via BullMQ queue with automatic retry, or fallback to in-process after()
    try { await enqueueAIScoring(
      {
        type: 'WRITING_SCORING',
        submissionId: submission.id,
        responseText,
        promptText: prompt.promptText,
        rubric: prompt.rubric,
      },
      async () => { after(() => runLocalScoring({ type: 'WRITING_SCORING', submissionId: submission.id, responseText, promptText: prompt.promptText, rubric: prompt.rubric })); }
    ); } catch (error) { await markScoringFailed({ type: 'WRITING_SCORING', submissionId: submission.id, responseText, promptText: prompt.promptText, rubric: prompt.rubric }); throw error; }

    return NextResponse.json(
      {
        message: 'Writing submitted successfully. Feedback will be available shortly.',
        submission: {
          id: submission.id,
          wordCount,
          status: submission.status,
          submittedAt: submission.submittedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Submit writing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';
import { scoreWritingWithAI } from '@/lib/scoring';

const component = (feedback: Record<string, unknown>, key: string): number | null =>
  typeof feedback[key] === 'number' ? (feedback[key] as number) : null;

/**
 * POST /api/writing/revise
 *
 * Evaluates a revised version of a student's essay and creates a WritingRevision record,
 * providing immediate before-and-after comparison metrics.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'STUDENT' || !user.hasModuleAccess) {
      return NextResponse.json({ error: 'Module access required' }, { status: 403 });
    }

    const body = await request.json();
    const { submissionId, essay: revisedText } = body;

    if (
      typeof submissionId !== 'string' ||
      typeof revisedText !== 'string' ||
      !revisedText.trim()
    ) {
      return NextResponse.json(
        { error: 'submissionId and revised essay text are required' },
        { status: 400 }
      );
    }

    // Find target submission and ensure ownership
    const submission = await prisma.writingSubmission.findFirst({
      where: {
        id: submissionId,
        userId: user.id,
      },
      include: {
        prompt: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found or unauthorized' },
        { status: 404 }
      );
    }

    // Rate limit: cooldown of 15 seconds between revisions
    const lastRevision = await prisma.writingRevision.findFirst({
      where: { writingSubmissionId: submission.id },
      orderBy: { createdAt: 'desc' },
    });

    if (lastRevision && Date.now() - new Date(lastRevision.createdAt).getTime() < 15 * 1000) {
      return NextResponse.json(
        { error: 'Mohon tunggu 15 detik sebelum mengirimkan revisi kembali.' },
        { status: 429 }
      );
    }

    const wordCount = revisedText.trim().split(/\s+/).filter((w) => w.length > 0).length;

    // Evaluate revision using AI
    const { score, feedback } = await scoreWritingWithAI(
      revisedText,
      submission.prompt.promptText,
      submission.prompt.rubric
    );

    const grammarScore = component(feedback, 'grammarScore');
    const clarityScore = component(feedback, 'clarityScore');
    const structureScore = component(feedback, 'structureScore');

    // Create revision record and increment submission's revision count in a transaction
    const [revision] = await prisma.$transaction([
      prisma.writingRevision.create({
        data: {
          writingSubmissionId: submission.id,
          responseText: revisedText,
          wordCount,
          grammarScore,
          clarityScore,
          structureScore,
          overallScore: score,
          aiFeedbackJson: {
            ...feedback,
            scoringValidated: true,
            scoringContext: {
              promptText: submission.prompt.promptText,
              rubric: submission.prompt.rubric,
            },
          },
        },
      }),
      prisma.writingSubmission.update({
        where: { id: submission.id },
        data: {
          revisionCount: { increment: 1 },
        },
      }),
    ]);

    // Record learning session for revision practice
    await prisma.learningSession.create({
      data: {
        userId: user.id,
        sectionType: 'writing_revision',
        durationSec: 0,
        completedAt: new Date(),
      },
    });

    await createAuditLog(
      user.id,
      'WRITING_REVISED',
      'WritingRevision',
      revision.id,
      { submissionId: submission.id, wordCount, score }
    );

    const originalOverall = submission.overallScore ?? 0;
    const originalGrammar = submission.grammarScore ?? 0;
    const originalClarity = submission.clarityScore ?? 0;
    const originalStructure = submission.structureScore ?? 0;

    return NextResponse.json(
      {
        message: 'Revisi berhasil dievaluasi!',
        revision: {
          id: revision.id,
          submissionId: submission.id,
          originalText: submission.responseText,
          revisedText,
          wordCount,
          scores: {
            overall: score,
            grammar: grammarScore,
            clarity: clarityScore,
            structure: structureScore,
          },
          originalScores: {
            overall: originalOverall,
            grammar: originalGrammar,
            clarity: originalClarity,
            structure: originalStructure,
          },
          delta: {
            overall: Math.round((score - originalOverall) * 10) / 10,
            grammar: Math.round(((grammarScore ?? 0) - originalGrammar) * 10) / 10,
            clarity: Math.round(((clarityScore ?? 0) - originalClarity) * 10) / 10,
            structure: Math.round(((structureScore ?? 0) - originalStructure) * 10) / 10,
          },
          feedback,
          createdAt: revision.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Submit writing revision error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat mengevaluasi revisi.' },
      { status: 500 }
    );
  }
}

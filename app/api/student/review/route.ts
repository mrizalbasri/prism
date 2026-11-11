export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';

/**
 * GET /api/student/review?attemptId=<optional>
 *
 * Returns the student's answers for a completed placement test alongside
 * the correct answer and explanation for each objective question, plus
 * AI feedback for writing and speaking sections.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const attemptId = request.nextUrl.searchParams.get('attemptId');

    // Find the target test attempt (latest completed, or specific one)
    const testAttempt = await prisma.testAttempt.findFirst({
      where: {
        userId: user.id,
        status: 'COMPLETED',
        ...(attemptId ? { id: attemptId } : {}),
      },
      orderBy: { completedAt: 'desc' },
      include: {
        sectionAttempts: {
          include: {
            objectiveAnswers: true,
            writingResponse: {
              select: {
                content: true,
                wordCount: true,
                feedback: true,
              },
            },
            speakingResponse: {
              select: {
                transcript: true,
                audioUrl: true,
                feedback: true,
              },
            },
          },
        },
      },
    });

    if (!testAttempt) {
      return NextResponse.json(
        { error: 'No completed test found' },
        { status: 404 }
      );
    }

    // Collect all question IDs from objective answers
    const questionIds = testAttempt.sectionAttempts.flatMap((sa) =>
      sa.objectiveAnswers.map((a) => a.questionId)
    );

    // Batch-fetch questions with explanations
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: {
        id: true,
        sectionType: true,
        questionText: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        metadata: true,
      },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Build per-section review data
    const sections = testAttempt.sectionAttempts.map((sa) => {
      // Objective sections: vocab, grammar, listening, reading
      const objectiveReview = sa.objectiveAnswers.map((answer) => {
        const question = questionMap.get(answer.questionId);
        return {
          questionId: answer.questionId,
          questionText: question?.questionText ?? '',
          options: question?.options ?? [],
          correctAnswer: question?.correctAnswer ?? '',
          selectedAnswer: answer.selectedOption,
          isCorrect: answer.isCorrect,
          explanation: question?.explanation ?? null,
          metadata: question?.metadata ?? null,
        };
      });

      return {
        sectionType: sa.sectionType,
        rawScore: sa.rawScore,
        totalQuestions: objectiveReview.length || (sa.writingResponse ? 1 : 0) || (sa.speakingResponse ? 1 : 0),
        correctCount: objectiveReview.filter((q) => q.isCorrect).length,
        questions: objectiveReview.length > 0 ? objectiveReview : undefined,
        // Writing / Speaking: return stored AI feedback
        writingFeedback: sa.writingResponse
          ? {
              essay: sa.writingResponse.content,
              wordCount: sa.writingResponse.wordCount,
              feedback: sa.writingResponse.feedback,
            }
          : undefined,
        speakingFeedback: sa.speakingResponse
          ? {
              transcript: sa.speakingResponse.transcript,
              audioUrl: sa.speakingResponse.audioUrl,
              feedback: sa.speakingResponse.feedback,
            }
          : undefined,
      };
    });

    return NextResponse.json({
      attemptId: testAttempt.id,
      completedAt: testAttempt.completedAt,
      sections,
    });
  } catch (error) {
    console.error('Get student review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

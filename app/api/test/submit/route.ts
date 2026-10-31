export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse, after } from 'next/server';
import { SectionStatus, TestAttemptStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';
import { runLocalScoring, markScoringFailed } from '@/lib/ai-scoring-processor';
import { enqueueAIScoring } from '@/lib/queue';
import { findExpiredSection, isSubmissionLocked } from '@/lib/test-security';
import { getTestSettings } from '@/lib/settings';

interface SubmitTestRequest {
  testAttemptId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let testAttemptId: string | undefined;
    try {
      const body: SubmitTestRequest = await request.json();
      testAttemptId = body?.testAttemptId;
    } catch {
      // Body might be empty
    }

    let testAttempt;
    if (testAttemptId) {
      testAttempt = await prisma.testAttempt.findFirst({
        where: {
          id: testAttemptId,
          userId: user.id,
        },
        include: {
          sectionAttempts: {
            include: {
              writingResponse: true,
              speakingResponse: true,
            },
          },
        },
      });
    } else {
      // Find active test attempt
      testAttempt = await prisma.testAttempt.findFirst({
        where: {
          userId: user.id,
          status: TestAttemptStatus.IN_PROGRESS,
        },
        include: {
          sectionAttempts: {
            include: {
              writingResponse: true,
              speakingResponse: true,
            },
          },
        },
      });
    }

    if (!testAttempt) {
      return NextResponse.json(
        { error: 'Active test attempt not found' },
        { status: 404 }
      );
    }

    testAttemptId = testAttempt.id;

    // Reject duplicate or already-finalized submissions.
    if (isSubmissionLocked(testAttempt.status)) {
      return NextResponse.json(
        { error: 'Test already submitted' },
        { status: 409 }
      );
    }

    const settings = await getTestSettings();
    const expiredSection = findExpiredSection(
      testAttempt.sectionAttempts,
      settings.durations,
    );
    if (expiredSection) {
      await prisma.sectionAttempt.update({
        where: { id: expiredSection.id },
        data: {
          status: SectionStatus.TIMED_OUT,
          endTime: new Date(),
        },
      });

      return NextResponse.json(
        { error: 'Waktu pengerjaan seksi ini telah habis.', code: 'TIMED_OUT' },
        { status: 403 },
      );
    }

    // Claim the attempt atomically so concurrent submit requests cannot both score it.
    const claimResult = await prisma.testAttempt.updateMany({
      where: {
        id: testAttemptId,
        userId: user.id,
        status: TestAttemptStatus.IN_PROGRESS,
      },
      data: {
        status: TestAttemptStatus.PROCESSING,
        submittedAt: new Date(),
      },
    });

    if (claimResult.count !== 1) {
      return NextResponse.json(
        { error: 'Test already submitted' },
        { status: 409 },
      );
    }

    // Mark all sections as completed
    for (const section of testAttempt.sectionAttempts) {
      if (section.status !== SectionStatus.COMPLETED) {
        await prisma.sectionAttempt.update({
          where: { id: section.id },
          data: {
            status: SectionStatus.COMPLETED,
            endTime: new Date(),
          },
        });
      }
    }

    // Create audit log
    await createAuditLog(
      user.id,
      'TEST_SUBMITTED',
      'TestAttempt',
      testAttemptId,
      { testAttemptId }
    );

    // Process AI scoring via BullMQ queue with automatic retry, or fallback to in-process after()
    try { await enqueueAIScoring(
      { type: 'TEST_SCORING', testAttemptId },
      async () => { after(() => runLocalScoring({ type: 'TEST_SCORING', testAttemptId })); }
    ); } catch (error) { await markScoringFailed({ type: 'TEST_SCORING', testAttemptId }); throw error; }

    return NextResponse.json(
      {
        message: 'Test submitted successfully. Results will be available shortly.',
        testAttemptId,
        status: TestAttemptStatus.PROCESSING,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Submit test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

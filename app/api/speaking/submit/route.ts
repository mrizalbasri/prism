import { ownsScoringAudio } from '@/lib/scoring-audio';
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

    // Check daily speaking limit (max 5 sessions per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailySessionsCount = await prisma.speakingSession.count({
      where: {
        userId: user.id,
        startedAt: {
          gte: today,
        },
      },
    });

    if (dailySessionsCount >= 5) {
      return NextResponse.json(
        { error: 'Batas limit harian tercapai. Anda hanya diperbolehkan mengirimkan latihan speaking 5 kali per hari untuk menghemat penggunaan API AI.' },
        { status: 429 }
      );
    }

    // Rate limit: mohon tunggu 30 detik di antara submisi
    const lastSession = await prisma.speakingSession.findFirst({
      where: { userId: user.id },
      orderBy: { startedAt: 'desc' },
    });

    if (lastSession && Date.now() - new Date(lastSession.startedAt).getTime() < 30 * 1000) {
      return NextResponse.json(
        { error: 'Mohon tunggu 30 detik sebelum mengirimkan latihan berbicara lagi.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { scenarioId, transcriptText, audioUrl, durationSec } = body;

    if (typeof scenarioId !== 'string' || (transcriptText !== undefined && typeof transcriptText !== 'string') || (!transcriptText?.trim() && !audioUrl)) {
      return NextResponse.json(
        { error: 'scenarioId and transcriptText or audioUrl are required' },
        { status: 400 }
      );
    }

    if (audioUrl && (typeof audioUrl !== 'string' || !await ownsScoringAudio(user.id, audioUrl))) return NextResponse.json({ error: 'Audio access denied' }, { status: 403 });
    // Get scenario
    const scenario = await prisma.speakingScenario.findUnique({
      where: { id: scenarioId },
    });

    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    // Create session
    const session = await prisma.speakingSession.create({
      data: {
        userId: user.id,
        scenarioId,
        transcriptText: transcriptText || "(Audio recording submitted)",
        audioUrl,
        durationSec: durationSec || 0,
        aiFeedbackJson: { scoringContext: { scenarioTitle: scenario.title, scenarioDescription: scenario.description, rubric: scenario.rubric } },
        status: ResponseStatus.PENDING,
        startedAt: new Date(),
      },
    });

    // Create learning session
    await prisma.learningSession.create({
      data: {
        userId: user.id,
        sectionType: 'speaking',
        durationSec: durationSec || 0,
        completedAt: new Date(),
      },
    });

    await createAuditLog(
      user.id,
      'SPEAKING_SUBMITTED',
      'SpeakingSession',
      session.id,
      { scenarioId, durationSec }
    );

    // Process AI scoring via BullMQ queue with automatic retry, or fallback to in-process after()
    try { await enqueueAIScoring(
      {
        type: 'SPEAKING_SCORING',
        sessionId: session.id,
        transcriptText,
        scenarioTitle: scenario.title,
        scenarioDescription: scenario.description,
        rubric: scenario.rubric,
        audioUrl: audioUrl || undefined,
      },
      async () => { after(() => runLocalScoring({ type: 'SPEAKING_SCORING', sessionId: session.id, transcriptText: transcriptText || '', scenarioTitle: scenario.title, scenarioDescription: scenario.description, rubric: scenario.rubric, audioUrl: audioUrl || undefined })); }
    ); } catch (error) { await markScoringFailed({ type: 'SPEAKING_SCORING', sessionId: session.id, transcriptText: transcriptText || '', scenarioTitle: scenario.title, scenarioDescription: scenario.description, rubric: scenario.rubric, audioUrl: audioUrl || undefined }); throw error; }

    return NextResponse.json(
      {
        message: 'Speaking submitted successfully. Feedback will be available shortly.',
        session: {
          id: session.id,
          status: session.status,
          startedAt: session.startedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Submit speaking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

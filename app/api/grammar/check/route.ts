export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { getExerciseById } from '@/lib/grammar-exercises';

interface CheckBody {
  exerciseId: string;
  answer: string;
}

/**
 * POST /api/grammar/check
 * Body: { exerciseId, answer }
 *
 * Returns correctness, the correct answer, and the explanation.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CheckBody = await request.json();
    if (!body?.exerciseId || !body?.answer) {
      return NextResponse.json({ error: 'exerciseId and answer are required' }, { status: 400 });
    }

    const exercise = getExerciseById(body.exerciseId);
    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    const isCorrect = exercise.correctAnswer === body.answer;

    return NextResponse.json(
      {
        isCorrect,
        correctAnswer: exercise.correctAnswer,
        explanation: exercise.explanation,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('[grammar/check]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

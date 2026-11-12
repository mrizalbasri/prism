export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { getExercisesByLevel, type GrammarLevel } from '@/lib/grammar-exercises';

/**
 * GET /api/grammar/exercises?level=BEGINNER|INTERMEDIATE|ADVANCED
 *
 * Returns grammar exercises, optionally filtered by level.
 * Strips correctAnswer from response — client must call /api/grammar/check.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const level = request.nextUrl.searchParams.get('level') as GrammarLevel | null;
    const validLevels: GrammarLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
    if (level && !validLevels.includes(level)) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
    }

    const data = getExercisesByLevel(level ?? undefined).map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ correctAnswer, ...rest }) => rest,
    );

    return NextResponse.json({ exercises: data });
  } catch (err) {
    console.error('[grammar/exercises]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

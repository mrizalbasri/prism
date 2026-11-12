import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  user: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getCurrentUserFromRequest: mocks.user,
}));

import { GET } from '@/app/api/grammar/exercises/route';
import { POST } from '@/app/api/grammar/check/route';

describe('GET /api/grammar/exercises', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    mocks.user.mockResolvedValue(null);
    const res = await GET(new NextRequest('http://localhost/api/grammar/exercises'));
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid level', async () => {
    mocks.user.mockResolvedValue({ id: 'u1' });
    const res = await GET(new NextRequest('http://localhost/api/grammar/exercises?level=INVALID'));
    expect(res.status).toBe(400);
  });

  it('returns all exercises when no level filter', async () => {
    mocks.user.mockResolvedValue({ id: 'u1' });
    const res = await GET(new NextRequest('http://localhost/api/grammar/exercises'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.exercises.length).toBeGreaterThan(0);
    // correctAnswer must NOT be exposed
    expect(body.exercises[0]).not.toHaveProperty('correctAnswer');
  });

  it('filters exercises by BEGINNER level', async () => {
    mocks.user.mockResolvedValue({ id: 'u1' });
    const res = await GET(new NextRequest('http://localhost/api/grammar/exercises?level=BEGINNER'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.exercises.every((e: { level: string }) => e.level === 'BEGINNER')).toBe(true);
  });
});

describe('POST /api/grammar/check', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    mocks.user.mockResolvedValue(null);
    const res = await POST(
      new NextRequest('http://localhost/api/grammar/check', {
        method: 'POST',
        body: JSON.stringify({ exerciseId: 'g001', answer: 'goes' }),
      }),
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 when body is missing fields', async () => {
    mocks.user.mockResolvedValue({ id: 'u1' });
    const res = await POST(
      new NextRequest('http://localhost/api/grammar/check', {
        method: 'POST',
        body: JSON.stringify({ exerciseId: 'g001' }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown exerciseId', async () => {
    mocks.user.mockResolvedValue({ id: 'u1' });
    const res = await POST(
      new NextRequest('http://localhost/api/grammar/check', {
        method: 'POST',
        body: JSON.stringify({ exerciseId: 'nonexistent', answer: 'foo' }),
      }),
    );
    expect(res.status).toBe(404);
  });

  it('returns isCorrect=true for correct answer', async () => {
    mocks.user.mockResolvedValue({ id: 'u1' });
    // g001: 'goes' is the correct answer
    const res = await POST(
      new NextRequest('http://localhost/api/grammar/check', {
        method: 'POST',
        body: JSON.stringify({ exerciseId: 'g001', answer: 'goes' }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isCorrect).toBe(true);
    expect(body.correctAnswer).toBe('goes');
    expect(body.explanation).toBeTruthy();
  });

  it('returns isCorrect=false for wrong answer', async () => {
    mocks.user.mockResolvedValue({ id: 'u1' });
    const res = await POST(
      new NextRequest('http://localhost/api/grammar/check', {
        method: 'POST',
        body: JSON.stringify({ exerciseId: 'g001', answer: 'go' }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isCorrect).toBe(false);
    expect(body.correctAnswer).toBe('goes');
  });
});

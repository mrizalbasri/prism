import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), audit: vi.fn(), find: vi.fn(), claim: vi.fn(), updated: vi.fn(), learning: vi.fn(), transaction: vi.fn() }));
vi.mock('@/lib/auth', () => ({ getCurrentUserFromRequest: mocks.auth, createAuditLog: mocks.audit }));
vi.mock('@/lib/prisma', () => ({ default: { vocabularySession: { findFirst: mocks.find, update: mocks.updated }, learningSession: { create: mocks.learning }, $transaction: mocks.transaction } }));
import { PATCH } from '@/app/api/vocabulary/session/route';
const request = () => new NextRequest('http://localhost/api/vocabulary/session', { method: 'PATCH', body: JSON.stringify({ sessionId: 'session', cardsReviewed: 1 }) });
beforeEach(() => {
  vi.resetAllMocks();
  mocks.auth.mockResolvedValue({ id: 'student', role: 'STUDENT', hasModuleAccess: true });
  mocks.find.mockResolvedValue({ id: 'session', startedAt: new Date(Date.now() - 1000), endedAt: null });
  mocks.claim.mockResolvedValue({ count: 1 });
  mocks.updated.mockResolvedValue({ id: 'session', endedAt: new Date() });
  mocks.transaction.mockImplementation(callback => callback({ vocabularySession: { updateMany: mocks.claim, findUniqueOrThrow: mocks.updated }, learningSession: { create: mocks.learning } }));
});
describe('ending vocabulary sessions', () => {
  it('persists completion and one learning record in a transaction', async () => {
    expect((await PATCH(request())).status).toBe(200);
    expect(mocks.claim).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'session', userId: 'student', endedAt: null }, data: expect.objectContaining({ endedAt: expect.any(Date) }) }));
    expect(mocks.learning).toHaveBeenCalledTimes(1);
  });
  it('rejects a concurrent completion without creating another record', async () => {
    let ended = false;
    mocks.claim.mockImplementation(async () => { if (ended) return { count: 0 }; ended = true; return { count: 1 }; });
    const responses = await Promise.all([PATCH(request()), PATCH(request())]);
    expect(responses.map(r => r.status).sort()).toEqual([200, 409]);
    expect(mocks.learning).toHaveBeenCalledTimes(1);
    expect(mocks.audit).toHaveBeenCalledTimes(1);
  });
  it('rejects an already ended session', async () => {
    mocks.find.mockResolvedValue({ endedAt: new Date() });
    expect((await PATCH(request())).status).toBe(409);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});

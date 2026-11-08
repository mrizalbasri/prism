import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ user: vi.fn(), cookie: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ default: { user: { findUnique: mocks.user } } }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: mocks.cookie }) }));
import { generateToken, getCurrentUser, getCurrentUserFromRequest } from "@/lib/auth";
const token = () => generateToken({ userId: "student", email: "student@example.com", role: "STUDENT" });
beforeEach(() => { vi.clearAllMocks(); mocks.cookie.mockReturnValue({ value: token() }); });
describe("active account enforcement", () => {
  it.each(["SUSPENDED", "INACTIVE"])("rejects %s with an existing valid login cookie", async status => { mocks.user.mockResolvedValue({ id: "student", status }); const request = new NextRequest("http://localhost", { headers: { cookie: "auth_token=" + token() } }); expect(await getCurrentUserFromRequest(request)).toBeNull(); expect(await getCurrentUser()).toBeNull(); });
  it("allows active accounts", async () => { mocks.user.mockResolvedValue({ id: "student", status: "ACTIVE" }); expect(await getCurrentUser()).toMatchObject({ id: "student" }); });
});

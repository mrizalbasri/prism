import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  user: vi.fn(),
  testAttempt: vi.fn(),
  question: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUserFromRequest: mocks.user,
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    testAttempt: {
      findFirst: mocks.testAttempt,
    },
    question: {
      findMany: mocks.question,
    },
  },
}));

import { GET } from "@/app/api/student/review/route";

describe("GET /api/student/review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if user is not authenticated", async () => {
    mocks.user.mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/api/student/review");
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it("returns 404 if no completed test attempt is found", async () => {
    mocks.user.mockResolvedValue({ id: "user-1", role: "STUDENT" });
    mocks.testAttempt.mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/student/review");
    const res = await GET(req);

    expect(res.status).toBe(404);
  });

  it("returns formatted review questions with explanations and feedback", async () => {
    mocks.user.mockResolvedValue({ id: "user-1", role: "STUDENT" });
    mocks.testAttempt.mockResolvedValue({
      id: "attempt-1",
      completedAt: new Date("2026-06-01T10:00:00Z"),
      sectionAttempts: [
        {
          sectionType: "GRAMMAR",
          rawScore: 80,
          objectiveAnswers: [
            {
              questionId: "q-1",
              selectedOption: "went",
              isCorrect: true,
            },
            {
              questionId: "q-2",
              selectedOption: "have go",
              isCorrect: false,
            },
          ],
        },
        {
          sectionType: "WRITING",
          rawScore: 75,
          objectiveAnswers: [],
          writingResponse: {
            content: "My academic essay...",
            wordCount: 150,
            feedback: { grammar: "Good structure", suggestions: ["Use varied vocabulary"] },
          },
        },
      ],
    });

    mocks.question.mockResolvedValue([
      {
        id: "q-1",
        sectionType: "GRAMMAR",
        questionText: "She ___ to school yesterday.",
        options: ["went", "goes", "gone"],
        correctAnswer: "went",
        explanation: "Past simple indicator 'yesterday'.",
        metadata: null,
      },
      {
        id: "q-2",
        sectionType: "GRAMMAR",
        questionText: "They ___ there before.",
        options: ["have gone", "have go", "has went"],
        correctAnswer: "have gone",
        explanation: "Present perfect requires past participle.",
        metadata: null,
      },
    ]);

    const req = new NextRequest("http://localhost:3000/api/student/review");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.attemptId).toBe("attempt-1");
    expect(body.sections).toHaveLength(2);

    const grammarSec = body.sections.find((s: { sectionType: string }) => s.sectionType === "GRAMMAR");
    expect(grammarSec).toBeDefined();
    expect(grammarSec.correctCount).toBe(1);
    expect(grammarSec.questions).toHaveLength(2);
    expect(grammarSec.questions[0].explanation).toBe("Past simple indicator 'yesterday'.");
    expect(grammarSec.questions[1].isCorrect).toBe(false);

    const writingSec = body.sections.find((s: { sectionType: string }) => s.sectionType === "WRITING");
    expect(writingSec).toBeDefined();
    expect(writingSec.writingFeedback.wordCount).toBe(150);
  });
});

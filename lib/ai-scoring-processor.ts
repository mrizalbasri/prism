import prisma from "@/lib/prisma";
import { Prisma, SectionType } from "@prisma/client";
import type { AIScoringJobData } from "@/lib/queue";
import { scoreWritingWithAI, scoreSpeakingWithAI, calculateWeightedScore, finalizeTestResults } from "@/lib/scoring";
export const SCORING_FAILURE_MESSAGE = "Penilaian AI gagal. Jawaban Anda tetap tersimpan. Hubungi admin untuk mengulang penilaian.";
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const component = (feedback: Record<string, unknown>, key: string) => typeof feedback[key] === "number" ? feedback[key] as number : null;
export async function processAIScoring(data: AIScoringJobData): Promise<void> {
  if (data.type === "TEST_SCORING") {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: data.testAttemptId }, include: { sectionAttempts: { include: {
            writingResponse: true, speakingResponse: true
          } } }
    });
    if (!attempt || attempt.status === "COMPLETED")
      return;
    for (const section of attempt.sectionAttempts) {
      const response = section.writingResponse || section.speakingResponse;
      if (object(response?.feedback).scoringValidated === true)
        continue;
      if (section.sectionType !== SectionType.WRITING && section.sectionType !== SectionType.SPEAKING)
        continue;
      const snapshot = section.feedback ? JSON.parse(section.feedback) : {};
      if (section.writingResponse?.userId && section.writingResponse.userId !== attempt.userId || section.speakingResponse?.userId && section.speakingResponse.userId !== attempt.userId)
        throw new Error("Response owner mismatch");
      const writing = section.writingResponse?.content.trim();
      const speaking = section.speakingResponse;
      const transcript = speaking?.transcript?.trim();
      const realTranscript = transcript && !["(Audio recording submitted)", "Transcription completed by AI."].includes(transcript);
      const submitted = writing || speaking?.audioUrl || realTranscript;
      const result = !submitted ? {
        score: 0, feedback: {}
      } : section.sectionType === SectionType.WRITING
        ? await scoreWritingWithAI(writing!, snapshot.prompt || "Respond to the prompt.", snapshot.rubric)
        : await scoreSpeakingWithAI(speaking?.transcript || "", snapshot.prompt || "Respond to the scenario.", snapshot.rubric, speaking?.audioUrl || undefined);
      const feedback = {
        ...result.feedback, scoringValidated: true
      } as Prisma.InputJsonValue;
      await prisma.$transaction([
        prisma.sectionAttempt.update({
          where: { id: section.id }, data: {
            rawScore: result.score, weightedScore: calculateWeightedScore(result.score, section.sectionType)
          }
        }),
        ...(section.writingResponse ? [prisma.writingResponse.update({
            where: { id: section.writingResponse.id }, data: { feedback }
          })] : []),
        ...(speaking ? [prisma.speakingResponse.update({
            where: { id: speaking.id }, data: {
              feedback, transcript: typeof result.feedback.transcript === "string" ? result.feedback.transcript : speaking.transcript
            }
          })] : []),
      ]);
    }
    await finalizeTestResults(data.testAttemptId);
    return;
  }
  if (data.type === "WRITING_SCORING") {
    const submission = await prisma.writingSubmission.findUnique({ where: { id: data.submissionId } });
    if (!submission || submission.status === "COMPLETED")
      return;
    await prisma.writingSubmission.update({
      where: { id: submission.id }, data: { status: "PROCESSING" }
    });
    const { score, feedback } = await scoreWritingWithAI(submission.responseText, data.promptText, data.rubric);
    await prisma.writingSubmission.update({
      where: { id: submission.id }, data: {
        status: "COMPLETED", completedAt: new Date(), overallScore: score, grammarScore: component(feedback, "grammarScore"), clarityScore: component(feedback, "clarityScore"), structureScore: component(feedback, "structureScore"), aiFeedbackJson: {
          ...feedback, scoringValidated: true, scoringContext: {
            promptText: data.promptText, rubric: data.rubric
          }
        } as Prisma.InputJsonValue
      }
    });
  }
  else {
    const session = await prisma.speakingSession.findUnique({ where: { id: data.sessionId } });
    if (!session || session.status === "COMPLETED")
      return;
    await prisma.speakingSession.update({
      where: { id: session.id }, data: { status: "PROCESSING" }
    });
    const { score, feedback } = await scoreSpeakingWithAI(session.transcriptText || "", data.scenarioTitle + "\n" + data.scenarioDescription, data.rubric, session.audioUrl || undefined);
    await prisma.speakingSession.update({
      where: { id: session.id }, data: {
        status: "COMPLETED", completedAt: new Date(), overallScore: score, fluencyScore: component(feedback, "fluencyScore"), pronunciationScore: component(feedback, "pronunciationScore"), grammarScore: component(feedback, "grammarScore"), transcriptText: typeof feedback.transcript === "string" ? feedback.transcript : session.transcriptText, aiFeedbackJson: {
          ...feedback, scoringValidated: true, scoringContext: {
            scenarioTitle: data.scenarioTitle, scenarioDescription: data.scenarioDescription, rubric: data.rubric
          }
        } as Prisma.InputJsonValue
      }
    });
  }
}
export async function markScoringFailed(data: AIScoringJobData): Promise<void> {
  if (data.type === "TEST_SCORING") {
    await prisma.testAttempt.updateMany({
      where: {
        id: data.testAttemptId, status: { not: "COMPLETED" }
      }, data: { status: "FAILED" }
    });
    return;
  }
  if (data.type === "WRITING_SCORING") {
    const row = await prisma.writingSubmission.findUnique({ where: { id: data.submissionId } });
    await prisma.writingSubmission.updateMany({
      where: {
        id: data.submissionId, status: { not: "COMPLETED" }
      }, data: {
        status: "FAILED", aiFeedbackJson: {
          ...object(row?.aiFeedbackJson), message: SCORING_FAILURE_MESSAGE
        } as Prisma.InputJsonValue
      }
    });
  }
  else {
    const row = await prisma.speakingSession.findUnique({ where: { id: data.sessionId } });
    await prisma.speakingSession.updateMany({
      where: {
        id: data.sessionId, status: { not: "COMPLETED" }
      }, data: {
        status: "FAILED", aiFeedbackJson: {
          ...object(row?.aiFeedbackJson), message: SCORING_FAILURE_MESSAGE
        } as Prisma.InputJsonValue
      }
    });
  }
}
export async function runLocalScoring(data: AIScoringJobData): Promise<void> {
  try {
    await processAIScoring(data);
  }
  catch (error) {
    console.error("Scoring failed", error);
    await markScoringFailed(data);
  }
}

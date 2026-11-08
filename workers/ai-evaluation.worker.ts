import { Worker } from "bullmq";
import { getRedisConnection, type AIScoringJobData } from "@/lib/queue";
import { processAIScoring, markScoringFailed } from "@/lib/ai-scoring-processor";
const connection = getRedisConnection();
export const aiWorker = connection ? new Worker<AIScoringJobData>("ai-scoring", async (job) => {
  try {
    await processAIScoring(job.data);
  }
  catch (error) {
    if (job.attemptsMade + 1 >= (job.opts.attempts || 1))
      await markScoringFailed(job.data);
    throw error;
  }
}, {
  connection, concurrency: 2
}) : null;
aiWorker?.on("failed", (job, error) => console.error("Scoring job failed", job?.id, error));

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { JobStore } from '../services/jobStore';
import { getAiProvider } from '../services/openaiProvider';

// Lightweight queue-like pattern: when a job is created, process it.
// For higher throughput, use Cloud Tasks / PubSub instead.

export const onAnalysisJobCreated = onDocumentCreated('analysis_jobs/{jobId}', async (event) => {
  const jobId = event.params.jobId;
  const snap = event.data;
  if (!snap) return;

  const job = snap.data() as any;
  if (!job || job.status !== 'queued') {
    return;
  }

  const jobStore = new JobStore();

  // Claim job (best-effort)
  const claimed = await jobStore.claimJob(jobId);
  if (!claimed) {
    logger.info('Job already claimed', { jobId });
    return;
  }

  try {
    const provider = getAiProvider(job.requestedProvider);
    const result = await provider.analyzeMedia({
      teamId: job.teamId,
      mediaAssetId: job.mediaAssetId,
      analysisVersion: job.analysisVersion
    });

    await jobStore.completeJob(jobId, {
      result,
      provider: provider.name
    });

    logger.info('Job succeeded', { jobId });
  } catch (err: any) {
    await jobStore.failJob(jobId, {
      errorMessage: err?.message ?? String(err)
    });

    logger.error('Job failed', { jobId, err: err?.message ?? String(err) });
  }
});

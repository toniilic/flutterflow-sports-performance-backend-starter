import { onRequest } from 'firebase-functions/v2/https';
import { z } from 'zod';
import { requireFirebaseIdToken } from '../utils/auth';
import { parseJsonBody } from '../utils/validation';
import { JobStore } from '../services/jobStore';

const StartAnalysisJobBody = z.object({
  teamId: z.string().min(1),
  mediaAssetId: z.string().min(1),
  analysisVersion: z.string().min(1).default('v1'),
  requestedProvider: z.enum(['openai', 'video_model']).optional()
});

export const startAnalysisJob = onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const auth = await requireFirebaseIdToken(req);
    const body = StartAnalysisJobBody.parse(parseJsonBody(req));

    const jobStore = new JobStore();
    const job = await jobStore.createOrGetJob({
      teamId: body.teamId,
      mediaAssetId: body.mediaAssetId,
      analysisVersion: body.analysisVersion,
      requestedByUid: auth.uid,
      requestedProvider: body.requestedProvider
    });

    res.status(200).json({
      jobId: job.id,
      status: job.status,
      idempotencyKey: job.idempotencyKey
    });
  } catch (err: any) {
    res.status(400).json({
      error: 'Bad Request',
      message: err?.message ?? String(err)
    });
  }
});

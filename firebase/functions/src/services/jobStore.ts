import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';
import { AnalyzeMediaResult } from './aiProvider';

let _appInitialized = false;
function ensureAdmin() {
  if (!_appInitialized) {
    initializeApp();
    _appInitialized = true;
  }
}

export type JobRecord = {
  id: string;
  teamId: string;
  mediaAssetId: string;
  analysisVersion: string;
  requestedByUid: string;
  requestedProvider?: 'openai' | 'video_model';
  idempotencyKey: string;
  status: 'queued' | 'processing' | 'succeeded' | 'failed';
};

export class JobStore {
  private db() {
    ensureAdmin();
    return getFirestore();
  }

  private makeIdempotencyKey(input: { mediaAssetId: string; analysisVersion: string }) {
    const h = crypto.createHash('sha256');
    h.update(`${input.mediaAssetId}:${input.analysisVersion}`);
    return h.digest('hex');
  }

  async createOrGetJob(input: {
    teamId: string;
    mediaAssetId: string;
    analysisVersion: string;
    requestedByUid: string;
    requestedProvider?: 'openai' | 'video_model';
  }): Promise<JobRecord> {
    const db = this.db();
    const idempotencyKey = this.makeIdempotencyKey({
      mediaAssetId: input.mediaAssetId,
      analysisVersion: input.analysisVersion
    });

    // Job doc id based on idempotency key (simple, deterministic)
    const jobRef = db.collection('analysis_jobs').doc(idempotencyKey);

    const snap = await jobRef.get();
    if (snap.exists) {
      const data = snap.data() as any;
      return {
        id: jobRef.id,
        teamId: data.teamId,
        mediaAssetId: data.mediaAssetId,
        analysisVersion: data.analysisVersion,
        requestedByUid: data.requestedByUid,
        requestedProvider: data.requestedProvider,
        idempotencyKey: data.idempotencyKey,
        status: data.status
      };
    }

    const record = {
      teamId: input.teamId,
      mediaAssetId: input.mediaAssetId,
      analysisVersion: input.analysisVersion,
      requestedByUid: input.requestedByUid,
      requestedProvider: input.requestedProvider ?? 'openai',
      idempotencyKey,
      status: 'queued' as const,
      attemptCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await jobRef.create(record);

    return {
      id: jobRef.id,
      teamId: input.teamId,
      mediaAssetId: input.mediaAssetId,
      analysisVersion: input.analysisVersion,
      requestedByUid: input.requestedByUid,
      requestedProvider: record.requestedProvider,
      idempotencyKey,
      status: 'queued'
    };
  }

  async claimJob(jobId: string): Promise<boolean> {
    const db = this.db();
    const ref = db.collection('analysis_jobs').doc(jobId);

    try {
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) {
          throw new Error('Job not found');
        }
        const data = snap.data() as any;
        if (data.status !== 'queued') {
          throw new Error('Job not queued');
        }

        tx.update(ref, {
          status: 'processing',
          attemptCount: (data.attemptCount ?? 0) + 1,
          startedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        });
      });
      return true;
    } catch {
      return false;
    }
  }

  async completeJob(jobId: string, input: { result: AnalyzeMediaResult; provider: string }) {
    const db = this.db();

    const jobRef = db.collection('analysis_jobs').doc(jobId);
    const resultRef = db.collection('analysis_results').doc(jobId);

    await db.runTransaction(async (tx) => {
      const jobSnap = await tx.get(jobRef);
      if (!jobSnap.exists) throw new Error('Job not found');
      const job = jobSnap.data() as any;

      tx.set(resultRef, {
        teamId: job.teamId,
        mediaAssetId: job.mediaAssetId,
        jobId,
        provider: input.provider,
        result: input.result,
        createdAt: FieldValue.serverTimestamp()
      });

      tx.update(jobRef, {
        status: 'succeeded',
        finishedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
    });
  }

  async failJob(jobId: string, input: { errorMessage: string }) {
    const db = this.db();
    const jobRef = db.collection('analysis_jobs').doc(jobId);
    await jobRef.update({
      status: 'failed',
      lastError: input.errorMessage,
      finishedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
  }
}

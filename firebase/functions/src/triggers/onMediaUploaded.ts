import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { logger } from 'firebase-functions';
import { JobStore } from '../services/jobStore';

// Storage path convention (recommended): media/{teamId}/{ownerUid}/{mediaId}

export const onMediaUploaded = onObjectFinalized(async (event) => {
  const object = event.data;
  const name = object.name ?? '';

  if (!name.startsWith('media/')) {
    return;
  }

  const parts = name.split('/');
  // media/{teamId}/{ownerUid}/{mediaId}
  if (parts.length < 4) {
    logger.warn('Unexpected media path', { name });
    return;
  }

  const teamId = parts[1];
  const ownerUid = parts[2];
  const mediaId = parts.slice(3).join('/');

  // In a real app you typically also create/validate the media_assets doc here.
  // For this starter, we just enqueue an analysis job if a matching media_assets ID exists.

  const jobStore = new JobStore();
  const job = await jobStore.createOrGetJob({
    teamId,
    mediaAssetId: mediaId,
    analysisVersion: 'v1',
    requestedByUid: ownerUid
  });

  logger.info('Enqueued analysis job from upload', {
    teamId,
    ownerUid,
    mediaId,
    jobId: job.id
  });
});

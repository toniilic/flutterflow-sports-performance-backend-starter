import { onRequest } from 'firebase-functions/v2/https';
import { z } from 'zod';
import { requireFirebaseIdToken } from '../utils/auth';
import { parseJsonBody } from '../utils/validation';

// NOTE: This is an optional endpoint. Many FlutterFlow apps upload using Firebase SDK directly.
// If you want signed URLs for upload, implement using GCS signed URLs with the Admin SDK.

const Body = z.object({
  teamId: z.string().min(1),
  ownerUid: z.string().min(1),
  mediaId: z.string().min(1),
  contentType: z.string().min(1).default('video/mp4')
});

export const createSignedUploadUrl = onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const auth = await requireFirebaseIdToken(req);
    const body = Body.parse(parseJsonBody(req));

    if (auth.uid !== body.ownerUid) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // TODO: Use firebase-admin storage().bucket().file(path).getSignedUrl({...})
    // Path convention: media/{teamId}/{ownerUid}/{mediaId}
    res.status(501).json({
      error: 'Not Implemented',
      message: 'Implement GCS signed URLs if needed.',
      suggestedPath: `media/${body.teamId}/${body.ownerUid}/${body.mediaId}`
    });
  } catch (err: any) {
    res.status(400).json({
      error: 'Bad Request',
      message: err?.message ?? String(err)
    });
  }
});

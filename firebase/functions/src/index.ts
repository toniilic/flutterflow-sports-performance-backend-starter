import { setGlobalOptions } from 'firebase-functions/v2';
import { startAnalysisJob } from './http/startAnalysisJob';
import { createSignedUploadUrl } from './http/createSignedUploadUrl';
import { onMediaUploaded } from './triggers/onMediaUploaded';
import { onAnalysisJobCreated } from './triggers/onAnalysisJobCreated';

setGlobalOptions({ region: 'us-central1' });

// HTTP endpoints (callable from FlutterFlow API Calls)
export { startAnalysisJob, createSignedUploadUrl };

// Triggers (async workflow)
export { onMediaUploaded, onAnalysisJobCreated };

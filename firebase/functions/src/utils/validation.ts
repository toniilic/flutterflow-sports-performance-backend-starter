import type { Request } from 'firebase-functions/v2/https';

export function parseJsonBody(req: Request): unknown {
  // firebase-functions v2 onRequest uses Express under the hood; body parsing may vary by runtime.
  // If you deploy with default settings, JSON parsing is usually enabled.
  // This helper normalizes input for local emulators and deployment.
  if (req.body && typeof req.body === 'object') return req.body;

  // Some environments may provide raw string body.
  if (typeof req.body === 'string') {
    return JSON.parse(req.body);
  }

  return {};
}

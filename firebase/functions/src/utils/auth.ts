import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { Request } from 'firebase-functions/v2/https';

let _appInitialized = false;
function ensureAdmin() {
  if (!_appInitialized) {
    initializeApp();
    _appInitialized = true;
  }
}

export async function requireFirebaseIdToken(req: Request): Promise<{ uid: string }>
{
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';

  if (!token) {
    throw new Error('Missing Authorization: Bearer <token>');
  }

  ensureAdmin();
  const decoded = await getAuth().verifyIdToken(token);
  return { uid: decoded.uid };
}

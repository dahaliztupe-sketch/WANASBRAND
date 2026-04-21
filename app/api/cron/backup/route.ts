import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Firestore Backup Cron — via Google Cloud Firestore REST API
 * Requires:
 *   - CRON_SECRET: Authorization header
 *   - FIREBASE_BACKUP_BUCKET: gs://your-bucket
 *   - FIREBASE_SERVICE_ACCOUNT_BASE64: Full service account JSON (base64)
 *
 * Schedule: daily at 2 AM Cairo time (recommended)
 */

async function getAccessToken(): Promise<string | null> {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64) return null;

  try {
    const sa = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8')) as {
      client_email: string;
      private_key: string;
    };

    const now   = Math.floor(Date.now() / 1000);
    const claim = {
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    const header  = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify(claim));
    const toSign  = `${header}.${payload}`;

    const privateKey = sa.private_key.replace(/\\n/g, '\n');
    const keyData = await crypto.subtle.importKey(
      'pkcs8',
      pemToArrayBuffer(privateKey),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      keyData,
      new TextEncoder().encode(toSign)
    );

    const jwt = `${toSign}.${arrayBufferToBase64Url(signature)}`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    const tokenData = await tokenRes.json() as { access_token?: string };
    return tokenData.access_token ?? null;
  } catch (e) {
    console.error('[Backup] Token error:', e);
    return null;
  }
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----[A-Z ]+-----/g, '').replace(/\s/g, '');
  const binary = atob(b64);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf.buffer;
}

function arrayBufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let b64 = '';
  bytes.forEach(b => { b64 += String.fromCharCode(b); });
  return btoa(b64).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const bucket    = process.env.FIREBASE_BACKUP_BUCKET;

  if (!projectId || !bucket) {
    return NextResponse.json({
      error: 'Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID or FIREBASE_BACKUP_BUCKET',
    }, { status: 503 });
  }

  try {
    const token = await getAccessToken();

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'No service account — backup skipped. Set FIREBASE_SERVICE_ACCOUNT_BASE64.',
        timestamp: new Date().toISOString(),
      });
    }

    const outputUriPrefix = `${bucket}/backups/${new Date().toISOString().split('T')[0]}`;

    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default):exportDocuments`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          outputUriPrefix,
          collectionIds: [],
        }),
      }
    );

    const data = await res.json() as { name?: string; error?: unknown };

    if (!res.ok) {
      console.error('[Backup] Export failed:', data);
      return NextResponse.json({ success: false, error: data }, { status: 500 });
    }

    console.info(`[Backup] Export initiated: ${data.name} → ${outputUriPrefix}`);

    return NextResponse.json({
      success: true,
      operation: data.name,
      outputUri: outputUriPrefix,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Backup] Cron error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }
}

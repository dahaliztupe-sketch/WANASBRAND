import { jwtVerify, SignJWT } from 'jose';

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('CRITICAL: SESSION_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}

export async function verifyAdminSession(token: string): Promise<{ uid: string; isAdmin: boolean }> {
  const secret = getSessionSecret();
  const { payload } = await jwtVerify(token, secret);
  return {
    uid: payload.uid as string,
    isAdmin: payload.isAdmin === true,
  };
}

export async function createAdminSession(uid: string): Promise<string> {
  const secret = getSessionSecret();
  return new SignJWT({ uid, isAdmin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export function extractSessionToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/);
  return match ? match[1] : null;
}

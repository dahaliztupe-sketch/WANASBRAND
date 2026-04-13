/**
 * Enterprise Security Configuration for WANAS.
 */

export const securityConfig = {
  rateLimiting: {
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
    auth: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // limit each IP to 5 failed login attempts per hour
    }
  },
  encryption: {
    algorithm: 'aes-256-gcm',
    keySize: 32,
    ivSize: 12,
  },
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  }
};

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SENTRY_DSN',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_GEMINI_API_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'JWT_SECRET',
  'CRON_SECRET',
  'ENCRYPTION_KEY',
  'RESEND_API_KEY',
] as const;

export function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  }

  // Security check: ensure no private keys leaked to NEXT_PUBLIC_
  const privatePattern = /SECRET|TOKEN|PRIVATE_KEY|PASSWORD/i;
  const publicLeakedKeys = Object.keys(process.env).filter(
    (key) => key.startsWith('NEXT_PUBLIC_') && privatePattern.test(key)
  );

  if (publicLeakedKeys.length > 0) {
    throw new Error(`🚨 SECURITY FATAL: Private keys exposed as public! Remove NEXT_PUBLIC_ from: ${publicLeakedKeys.join(', ')}`);
  }

  console.log('✅ All required environment variables are present and secure');
}

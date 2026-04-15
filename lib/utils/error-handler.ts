import * as Sentry from '@sentry/nextjs';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown, context: string): never {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`❌ [${context}]: ${message}`);
  Sentry.captureException(error, { contexts: { data: { context } } });
  throw new AppError(message, 'OPERATION_FAILED', context);
}

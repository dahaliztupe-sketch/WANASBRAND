export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => console.debug(`[DEBUG] ${msg}`, meta),
  info: (msg: string, meta?: Record<string, unknown>) => console.info(`[INFO] ${msg}`, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => console.warn(`[WARN] ${msg}`, meta),
  error: (msg: string, error?: unknown, meta?: Record<string, unknown>) => console.error(`[ERROR] ${msg}`, { error, ...meta }),
};

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://55cda9160f216f30bdc8194bce7d11f3@o4511147998314496.ingest.de.sentry.io/4511148004606032",
  tracesSampleRate: 1.0,
  debug: false,
  automaticVercelMonitors: true,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

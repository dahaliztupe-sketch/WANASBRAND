'use client';

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { motion } from "motion/react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-primary px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center space-y-8"
          >
            <div className="space-y-4">
              <h1 className="font-serif text-4xl text-primary italic">A Moment of Calm</h1>
              <p className="text-primary/60 font-light leading-relaxed tracking-wide">
                Our atelier is currently experiencing a technical interruption. 
                We are working to restore the serenity of your experience.
              </p>
            </div>

            <div className="pt-8">
              <button
                onClick={() => reset()}
                className="px-12 py-4 bg-inverted text-inverted text-[10px] uppercase tracking-[0.3em] hover:bg-accent-primary transition-all duration-700 shadow-sm hover:shadow-xl"
              >
                Restore Experience
              </button>
            </div>
            
            <p className="text-[10px] text-primary/30 uppercase tracking-widest pt-12">
              Error ID: {error.digest || "Unknown"}
            </p>
          </motion.div>
        </div>
      </body>
    </html>
  );
}

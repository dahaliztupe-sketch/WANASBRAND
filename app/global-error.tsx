'use client';

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { motion } from "motion/react";

import "./globals.css";
import { Logo } from "@/components/Logo";

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
    <html lang="en">
      <head>
        <title>Something went wrong | WANAS</title>
      </head>
      <body className="bg-[#FDFBF7]">
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#FDFBF7] relative overflow-hidden">
          {/* Subtle Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center max-w-md w-full"
          >
            <Logo className="w-24 h-auto mb-16 text-primary" />
            
            <div className="space-y-6 mb-16">
              <h1 className="font-serif text-3xl md:text-4xl text-primary tracking-[0.15em] uppercase">
                A Moment of Calm
              </h1>
              <div className="w-16 h-[1px] bg-[#D4AF37] mx-auto opacity-50" />
              <p className="text-primary/60 font-light leading-loose tracking-widest uppercase text-[10px]">
                Our atelier is currently experiencing a technical interruption.<br/>
                Our artisans have been notified and are working to restore the serenity of your experience.
              </p>
            </div>

            <button
              onClick={() => reset()}
              className="group relative px-12 py-5 overflow-hidden border border-primary/20 transition-all duration-700 hover:border-primary"
            >
              <span className="relative z-10 text-[10px] uppercase tracking-[0.5em] text-primary group-hover:text-[#FDFBF7] transition-colors duration-700">
                Restore Experience
              </span>
              <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out" />
            </button>
            
            <p className="text-[9px] text-primary/20 uppercase tracking-[0.5em] pt-16 font-bold">
              Error ID: {error.digest || "Internal Atelier Error"}
            </p>
          </motion.div>
        </div>
      </body>
    </html>
  );
}

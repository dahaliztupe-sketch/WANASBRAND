'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-primary text-primary p-12">
          <div className="max-w-xl w-full text-center space-y-12">
            <div className="space-y-6">
              <h2 className="text-5xl font-serif tracking-tight text-primary">A Moment of Calm</h2>
              <div className="w-16 h-px bg-accent-primary mx-auto" />
              <p className="text-sm text-primary/50 font-light tracking-widest uppercase leading-relaxed max-w-sm mx-auto">
                An unexpected ripple has touched our atelier. We are restoring the peace.
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-6">
              <button
                className="bg-inverted text-inverted px-12 py-5 uppercase tracking-[0.3em] text-[10px] hover:bg-accent-primary transition-all duration-700 shadow-sm"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
              >
                Return to the Atelier
              </button>
              
              <p className="text-[10px] text-primary/30 uppercase tracking-widest font-light">
                Our artisans have been notified of this occurrence.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-12 p-8 bg-inverted/[0.02] border border-primary/5 text-left">
                <p className="text-[10px] uppercase tracking-widest text-primary/40 mb-4">Technical Insight</p>
                <pre className="text-[10px] font-mono text-primary/60 overflow-auto whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

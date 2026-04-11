import React from 'react';

export function ConciergeLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

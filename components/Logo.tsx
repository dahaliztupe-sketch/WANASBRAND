import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 60" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      dir="ltr"
    >
      {/* Stylized W / Thread Icon */}
      <path 
        d="M20 15 L35 45 L50 15 L65 45 L80 15" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Needle point */}
      <circle cx="80" cy="15" r="1" fill="currentColor" />
      
      {/* WANAS Text */}
      <text 
        x="95" 
        y="35" 
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
        fontSize="22" 
        fontWeight="300" 
        letterSpacing="0.3em" 
        fill="currentColor"
      >WANAS</text>
      
      {/* ATELIER Text */}
      <text 
        x="95" 
        y="52" 
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
        fontSize="8" 
        fontWeight="400" 
        letterSpacing="0.6em" 
        fill="currentColor" 
        opacity="0.5"
      >ATELIER</text>
    </svg>
  );
}

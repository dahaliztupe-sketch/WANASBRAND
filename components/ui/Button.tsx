'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'outline' | 'danger';
type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  children?: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:   'bg-inverted text-inverted hover:bg-accent-primary hover:text-primary border border-transparent',
  secondary: 'bg-transparent text-primary border border-primary/30 hover:border-accent-primary hover:text-accent-primary',
  ghost:     'bg-transparent text-primary/70 hover:text-accent-primary hover:bg-accent-primary/5 border border-transparent',
  gold:      'bg-accent-primary text-primary hover:bg-accent-hover border border-transparent shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_32px_rgba(212,175,55,0.4)]',
  outline:   'bg-transparent text-accent-primary border border-accent-primary hover:bg-accent-primary hover:text-primary',
  danger:    'bg-transparent text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  xs: 'px-3 py-1.5 text-[9px] tracking-[0.25em] min-h-[30px]',
  sm: 'px-4 py-2   text-[10px] tracking-[0.25em] min-h-[36px]',
  md: 'px-6 py-3   text-[10px] tracking-[0.28em] min-h-[44px]',
  lg: 'px-8 py-4   text-xs     tracking-[0.3em]  min-h-[52px]',
  xl: 'px-10 py-5  text-xs     tracking-[0.35em] min-h-[60px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'start',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileTap={{ scale: isDisabled ? 1 : 0.97 }}
      whileHover={{ scale: isDisabled ? 1 : 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={isDisabled}
      className={[
        'relative inline-flex items-center justify-center gap-2',
        'font-sans uppercase font-medium select-none',
        'transition-all duration-300 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        'overflow-hidden group',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {/* Shimmer overlay on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
      />

      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        icon && iconPosition === 'start' && <span className="shrink-0">{icon}</span>
      )}

      {children && <span>{children}</span>}

      {!loading && icon && iconPosition === 'end' && (
        <span className="shrink-0">{icon}</span>
      )}
    </motion.button>
  );
}

/** Icon-only button (square, centered icon) */
export function IconButton({
  children,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...props
}: Omit<ButtonProps, 'icon' | 'iconPosition' | 'fullWidth'>) {
  const iconSizes: Record<ButtonSize, string> = {
    xs: 'w-7 h-7',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14',
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`${iconSizes[size]} p-0 rounded-none ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}

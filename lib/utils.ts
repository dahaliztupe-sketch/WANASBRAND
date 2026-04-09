import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, locale: 'en' | 'ar' = 'en'): string {
  if (locale === 'ar') {
    return `${amount.toLocaleString('ar-EG')} ج.م`;
  }
  return `EGP ${amount.toLocaleString('en-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

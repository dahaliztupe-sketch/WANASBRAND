/**
 * WANAS Validation Utilities
 */

/**
 * Validates Egyptian phone numbers.
 * Format: 010, 011, 012, or 015 followed by 8 digits.
 * 
 * @param phone - The phone number string to validate.
 * @returns True if valid, false otherwise.
 */
export function isValidEgyptianPhone(phone: string): boolean {
  if (!phone) return false;
  // Remove any spaces or dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');
  const regex = /^01[0125][0-9]{8}$/;
  return regex.test(cleanPhone);
}

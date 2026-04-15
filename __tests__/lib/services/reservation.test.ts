import { isValidEgyptianPhone } from '@/lib/utils/validation';

describe('Reservation Validation', () => {
  describe('isValidEgyptianPhone', () => {
    it('should validate correct Vodafone numbers (010)', () => {
      expect(isValidEgyptianPhone('01012345678')).toBe(true);
    });

    it('should validate correct Etisalat numbers (011)', () => {
      expect(isValidEgyptianPhone('01112345678')).toBe(true);
    });

    it('should validate correct Orange numbers (012)', () => {
      expect(isValidEgyptianPhone('01212345678')).toBe(true);
    });

    it('should validate correct WE numbers (015)', () => {
      expect(isValidEgyptianPhone('01512345678')).toBe(true);
    });

    it('should handle spaces and dashes', () => {
      expect(isValidEgyptianPhone('010 1234 5678')).toBe(true);
      expect(isValidEgyptianPhone('010-1234-5678')).toBe(true);
    });

    it('should reject numbers with wrong length', () => {
      expect(isValidEgyptianPhone('0101234567')).toBe(false); // 10 digits
      expect(isValidEgyptianPhone('010123456789')).toBe(false); // 12 digits
    });

    it('should reject numbers with wrong prefix', () => {
      expect(isValidEgyptianPhone('01312345678')).toBe(false);
      expect(isValidEgyptianPhone('01412345678')).toBe(false);
      expect(isValidEgyptianPhone('01612345678')).toBe(false);
      expect(isValidEgyptianPhone('01712345678')).toBe(false);
      expect(isValidEgyptianPhone('01812345678')).toBe(false);
      expect(isValidEgyptianPhone('01912345678')).toBe(false);
    });

    it('should reject non-numeric characters', () => {
      expect(isValidEgyptianPhone('0101234567a')).toBe(false);
    });

    it('should reject empty strings', () => {
      expect(isValidEgyptianPhone('')).toBe(false);
    });
  });
});

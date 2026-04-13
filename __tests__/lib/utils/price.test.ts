import { formatPrice } from '@/lib/utils/price';

describe('formatPrice', () => {
  it('formats EGP currency correctly', () => {
    expect(formatPrice(1000)).toBe('1,000 EGP');
  });
});

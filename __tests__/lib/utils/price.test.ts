// Dummy test to ensure Jest is configured correctly

describe('Price Utils', () => {
  it('should format price correctly', () => {
    const formatPrice = (price: number) => `EGP ${price.toLocaleString()}`;
    expect(formatPrice(1500)).toBe('EGP 1,500');
  });
});

/**
 * Price verification utility.
 * Calculates VAT and shipping fees based on database prices.
 */

const VAT_RATE = 0.14; // 14%

export const calculateFinancials = (subtotal: number) => {
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;
  return {
    subtotal: Number(subtotal.toFixed(2)),
    vat: Number(vat.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
};

export const verifyTotal = (subtotal: number, totalAmount: number): boolean => {
  const { total } = calculateFinancials(subtotal);
  return Math.abs(total - totalAmount) < 0.01;
};

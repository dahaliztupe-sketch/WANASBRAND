/**
 * Price verification utility.
 * Calculates VAT and shipping fees based on database prices.
 */

const VAT_RATE = 0.14; // 14%

/**
 * Calculates the subtotal, VAT, and total for a given subtotal.
 * @param subtotal - The subtotal amount.
 * @returns An object containing subtotal, VAT, and total amounts.
 */
export const calculateFinancials = (subtotal: number) => {
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;
  return {
    subtotal: Number(subtotal.toFixed(2)),
    vat: Number(vat.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
};

/**
 * Verifies if the provided total amount matches the calculated total from the subtotal.
 * @param subtotal - The subtotal amount.
 * @param totalAmount - The total amount to verify.
 * @returns True if the total matches, false otherwise.
 */
export const verifyTotal = (subtotal: number, totalAmount: number): boolean => {
  const { total } = calculateFinancials(subtotal);
  return Math.abs(total - totalAmount) < 0.01;
};

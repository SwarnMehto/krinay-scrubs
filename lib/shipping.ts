export type ShippingPaymentMethod = "prepaid" | "cod";

export function calculateShippingCharge(
  subtotal: number,
  discount: number,
  paymentMethod: ShippingPaymentMethod,
) {
  if (paymentMethod === "cod") {
    const codOrderAmount = Math.max(subtotal - discount, 0);

    if (subtotal <= 0) {
      return 0;
    }

    return codOrderAmount >= 1299 ? 100 : 50;
  }

  return subtotal === 0 || subtotal >= 999 ? 0 : 99;
}

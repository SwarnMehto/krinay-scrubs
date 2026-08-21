import type {
  CartEmbroidery,
  ScrubPurchaseType,
} from "@/types/cart";

export type PaymentMethod =
  | "prepaid"
  | "cod";

export interface OrderCustomerInput {
  fullName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface OrderItemInput {
  productId: string;
  name: string;
  slug: string;
  image: string;

  /*
   * Client price is sent for display compatibility,
   * but /api/orders recalculates the trusted price
   * from data/products.ts.
   */
  price: number;
  basePrice?: number;

  /*
   * Existing size field remains for backward compatibility.
   *
   * Set example:
   * "Top M / Bottom L"
   */
  size: string;

  color: string;
  quantity: number;
  cartKey?: string;

  /*
   * New scrub purchase configuration.
   */
  purchaseType?: ScrubPurchaseType;
  topSize?: string;
  bottomSize?: string;

  /*
   * Pricing metadata used in cart/order/invoice display.
   * Server recalculates these for supported scrub products.
   */
  mrp?: number;
  discountPercent?: number;
  discountAmount?: number;

  embroidery?: CartEmbroidery;
}

export interface CreateOrderInput {
  customer: OrderCustomerInput;
  items: OrderItemInput[];
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

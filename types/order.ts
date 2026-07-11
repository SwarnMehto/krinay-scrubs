export type OrderPaymentMethod = "prepaid" | "cod";

export type OrderPaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cod_pending"
  | "refunded";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "cancelled"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "returned";

export type ShipmentApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

export type OrderItemInput = {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
};

export type ShippingAddressInput = {
  fullName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pinCode: string;
};

export type CreateOrderInput = {
  customer: ShippingAddressInput;
  paymentMethod: OrderPaymentMethod;
  items: OrderItemInput[];
  couponCode?: string;
};
export type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayFailureResponse = {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
};

export type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;

  handler: (
    response: RazorpayPaymentResponse,
  ) => void | Promise<void>;

  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };

  notes?: Record<string, string>;

  theme?: {
    color?: string;
  };

  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
};

export type RazorpayInstance = {
  open: () => void;

  on: (
    eventName: "payment.failed",
    callback: (
      response: RazorpayFailureResponse,
    ) => void,
  ) => void;
};

declare global {
  interface Window {
    Razorpay: new (
      options: RazorpayOptions,
    ) => RazorpayInstance;
  }
}

export {};
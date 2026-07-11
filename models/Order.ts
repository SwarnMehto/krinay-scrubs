import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const orderItemSchema = new Schema(
  {
    productId: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    size: {
      type: String,
      required: true,
      trim: true,
    },

    color: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  },
);

const shippingAddressSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: /^[6-9]\d{9}$/,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    addressLine1: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },

    addressLine2: {
      type: String,
      default: "",
      trim: true,
      maxlength: 250,
    },

    landmark: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    pinCode: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{6}$/,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const pricingSchema = new Schema(
  {
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    shippingCharge: {
      type: Number,
      required: true,
      min: 0,
    },

    gstIncluded: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    customer: {
      type: shippingAddressSchema,
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator(items: unknown[]) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "Order me kam-se-kam ek product hona chahiye.",
      },
    },

    pricing: {
      type: pricingSchema,
      required: true,
    },

    couponCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    paymentMethod: {
      type: String,
      enum: ["prepaid", "cod"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "cod_pending",
        "refunded",
      ],
      required: true,
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "cancelled",
        "shipped",
        "out_for_delivery",
        "delivered",
        "returned",
      ],
      required: true,
      default: "pending",
      index: true,
    },

    shipmentApprovalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      required: true,
      default: "pending",
      index: true,
    },

    razorpayOrderId: {
      type: String,
      default: "",
      trim: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
      trim: true,
    },

    shiprocketOrderId: {
      type: String,
      default: "",
      trim: true,
    },

    shiprocketShipmentId: {
      type: String,
      default: "",
      trim: true,
    },

    awbCode: {
      type: String,
      default: "",
      trim: true,
    },

    courierName: {
      type: String,
      default: "",
      trim: true,
    },

    trackingUrl: {
      type: String,
      default: "",
      trim: true,
    },

    adminNotes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({ "customer.phone": 1 });
orderSchema.index({ createdAt: -1 });

export type OrderDocument = InferSchemaType<typeof orderSchema>;

const Order =
  (models.Order as Model<OrderDocument>) ||
  model<OrderDocument>("Order", orderSchema);

export default Order;
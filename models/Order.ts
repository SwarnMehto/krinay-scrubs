import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const embroiderySchema = new Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },

    mode: {
      type: String,
      enum: ["bundle", "top", "bottom"],
      default: "top",
    },

    placement: {
      type: String,
      enum: [
        "top",
        "bottom",
        "left-chest",
        "right-chest",
        "left-sleeve",
        "right-sleeve",
        "other",
      ],
      default: "top",
    },

    line1: {
      type: String,
      default: "",
      trim: true,
      maxlength: 22,
    },

    line2: {
      type: String,
      default: "",
      trim: true,
      maxlength: 22,
    },

    font: {
      type: String,
      enum: ["block", "script"],
      default: "block",
    },

    textColor: {
      type: String,
      enum: ["white", "black", "gold", "grey", "lime", "pink"],
      default: "white",
    },

    addBottomName: {
      type: Boolean,
      default: false,
    },

    selectedIconId: {
      type: String,
      default: "",
      trim: true,
    },

    selectedIconLabel: {
      type: String,
      default: "",
      trim: true,
    },

    selectedIconSymbol: {
      type: String,
      default: "",
      trim: true,
    },

    fileName: {
      type: String,
      default: "",
      trim: true,
    },

    fileUrl: {
      type: String,
      default: "",
      trim: true,
    },

    publicId: {
      type: String,
      default: "",
      trim: true,
    },

    basePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    logoPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    bottomNamePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    type: {
      type: String,
      enum: ["name", "logo"],
      default: "name",
    },

    instructions: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  {
    _id: false,
  },
);

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

    /*
     * Selling price before embroidery.
     *
     * Size surcharge is already included
     * in this amount where applicable.
     */
    basePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
     * Scrub size surcharge: +₹250 if any selected size is XXL or above.
     */
    sizeSurcharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
     * Original MRP before product discount.
     */
    mrp: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
     * Scrub purchase configuration.
     * Existing/older products can leave these blank.
     */
    purchaseType: {
      type: String,
      enum: ["set", "top", "bottom", ""],
      default: "",
    },

    topSize: {
      type: String,
      default: "",
      trim: true,
    },

    bottomSize: {
      type: String,
      default: "",
      trim: true,
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

    cartKey: {
      type: String,
      default: "",
      trim: true,
    },

    embroidery: {
      type: embroiderySchema,
      default: undefined,
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

    invoiceAccessToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
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
        message: "The order must contain at least one product.",
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

    shiprocketTrackingUpdatedAt: {
      type: Date,
      default: null,
    },

    adminOrderNotifiedAt: {
      type: Date,
      default: null,
    },

    customerOrderNotifiedAt: {
      type: Date,
      default: null,
    },

    inventoryDeducted: {
  type: Boolean,
  default: false,
  index: true,
},

inventoryDeductedAt: {
  type: Date,
  default: null,
},

inventoryRestored: {
  type: Boolean,
  default: false,
},

inventoryRestoredAt: {
  type: Date,
  default: null,
},

    rewardPointsAwarded: {
      type: Number,
      default: 0,
      min: 0,
    },

    rewardAwardedAt: {
      type: Date,
      default: null,
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

export type OrderDocument =
  InferSchemaType<
    typeof orderSchema
  >;

const Order =
  (models.Order as Model<OrderDocument>) ||
  model<OrderDocument>(
    "Order",
    orderSchema,
  );

export default Order;
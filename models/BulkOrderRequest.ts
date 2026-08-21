import {
  Schema,
  model,
  models,
} from "mongoose";

const bulkOrderRequestSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    organization: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    colours: {
      type: String,
      default: "",
      trim: true,
    },

    sizes: {
      type: String,
      default: "",
      trim: true,
    },

    embroidery: {
      type: String,
      enum: ["Yes", "No", "Not sure"],
      default: "No",
    },

    message: {
      type: String,
      default: "",
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "quoted",
        "closed",
      ],
      default: "new",
    },
  },
  {
    timestamps: true,
  },
);

const BulkOrderRequest =
  models.BulkOrderRequest ||
  model(
    "BulkOrderRequest",
    bulkOrderRequestSchema,
  );

export default BulkOrderRequest;
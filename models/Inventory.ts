import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const sizeStockSchema = new Schema(
  {
    size: {
      type: String,
      required: true,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const inventorySchema = new Schema(
  {
    productId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex"],
      required: true,
    },

    color: {
      type: String,
      required: true,
      trim: true,
    },

    topStock: {
      type: [sizeStockSchema],
      default: [],
    },

    bottomStock: {
      type: [sizeStockSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

inventorySchema.index(
  {
    productId: 1,
    color: 1,
  },
  {
    unique: true,
  },
);

export type InventoryDocument =
  InferSchemaType<
    typeof inventorySchema
  >;

const Inventory =
  (models.Inventory as Model<InventoryDocument>) ||
  model<InventoryDocument>(
    "Inventory",
    inventorySchema,
  );

export default Inventory;
import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const rewardTransactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "signup_bonus",
        "order_reward",
        "free_scrub_redemption",
        "manual_adjustment",
      ],
      required: true,
    },

    points: {
      type: Number,
      required: true,
    },

    referenceKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  },
);

rewardTransactionSchema.index({ userId: 1, createdAt: -1 });

export type RewardTransactionDocument = InferSchemaType<
  typeof rewardTransactionSchema
>;

const RewardTransaction =
  (models.RewardTransaction as Model<RewardTransactionDocument>) ||
  model<RewardTransactionDocument>(
    "RewardTransaction",
    rewardTransactionSchema,
  );

export default RewardTransaction;

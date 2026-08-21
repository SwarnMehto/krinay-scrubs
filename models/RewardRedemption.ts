import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const rewardRedemptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },

    rewardType: {
      type: String,
      enum: ["free_custom_scrub"],
      default: "free_custom_scrub",
      required: true,
    },

    pointsSpent: {
      type: Number,
      default: 1500,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "fulfilled", "cancelled"],
      default: "pending",
      index: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

rewardRedemptionSchema.index({ userId: 1, createdAt: -1 });

export type RewardRedemptionDocument = InferSchemaType<
  typeof rewardRedemptionSchema
>;

const RewardRedemption =
  (models.RewardRedemption as Model<RewardRedemptionDocument>) ||
  model<RewardRedemptionDocument>(
    "RewardRedemption",
    rewardRedemptionSchema,
  );

export default RewardRedemption;

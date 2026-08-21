import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const authOtpSchema = new Schema(
  {
    identifier: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    channel: {
      type: String,
      enum: ["email", "phone"],
      required: true,
    },

    purpose: {
      type: String,
      enum: ["register", "login", "reset"],
      required: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    consumedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

authOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
authOtpSchema.index({ identifier: 1, purpose: 1, createdAt: -1 });

export type AuthOtpDocument = InferSchemaType<typeof authOtpSchema>;

const AuthOtp =
  (models.AuthOtp as Model<AuthOtpDocument>) ||
  model<AuthOtpDocument>("AuthOtp", authOtpSchema);

export default AuthOtp;

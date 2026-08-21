import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: undefined,
    },

    phone: {
      type: String,
      trim: true,
      default: undefined,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    points: {
      type: Number,
      default: 0,
      min: 0,
    },

    wishlistProductIds: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index(
  { email: 1 },
  {
    unique: true,
    sparse: true,
  },
);

userSchema.index(
  { phone: 1 },
  {
    unique: true,
    sparse: true,
  },
);

export type UserDocument = InferSchemaType<typeof userSchema>;

const User =
  (models.User as Model<UserDocument>) ||
  model<UserDocument>("User", userSchema);

export default User;

import mongoose, {
  Model,
  Schema,
} from "mongoose";

export interface IAdminPasswordOtp {
  adminId: mongoose.Types.ObjectId;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const AdminPasswordOtpSchema =
  new Schema<IAdminPasswordOtp>(
    {
      adminId: {
        type: Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
        unique: true,
        index: true,
      },

      otpHash: {
        type: String,
        required: true,
      },

      expiresAt: {
        type: Date,
        required: true,
        index: true,
      },

      attempts: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: {
        createdAt: true,
        updatedAt: false,
      },

      versionKey: false,
    },
  );

AdminPasswordOtpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);

const AdminPasswordOtp: Model<IAdminPasswordOtp> =
  mongoose.models.AdminPasswordOtp ||
  mongoose.model<IAdminPasswordOtp>(
    "AdminPasswordOtp",
    AdminPasswordOtpSchema,
  );

export default AdminPasswordOtp;
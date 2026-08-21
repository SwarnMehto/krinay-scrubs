import mongoose, {
  Model,
  Schema,
} from "mongoose";

export interface ReviewDocument {
  productId: string;
  productSlug: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema =
  new Schema<ReviewDocument>(
    {
      productId: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      productSlug: {
        type: String,
        required: true,
        trim: true,
      },

      productName: {
        type: String,
        required: true,
        trim: true,
      },

      customerName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 60,
      },

      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },

      comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 800,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    },
  );

reviewSchema.index({
  productId: 1,
  createdAt: -1,
});

const Review: Model<ReviewDocument> =
  mongoose.models.Review
    ? (mongoose.models.Review as Model<ReviewDocument>)
    : mongoose.model<ReviewDocument>(
        "Review",
        reviewSchema,
      );

export default Review;
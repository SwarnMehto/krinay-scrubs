import mongoose, {
  Schema,
} from "mongoose";

const BlogSchema =
  new Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },

      slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
      },

      excerpt: {
        type: String,
        required: true,
        trim: true,
      },

      content: {
        type: String,
        required: true,
      },

      featuredImage: {
        type: String,
        default: "",
      },

      imageAlt: {
        type: String,
        default: "",
      },

      author: {
        type: String,
        default:
          "Krinay Editorial Team",
      },

      category: {
        type: String,
        default:
          "Scrub Guide",
      },

      tags: {
        type: [String],
        default: [],
      },

      status: {
        type: String,

        enum: [
          "draft",
          "published",
        ],

        default:
          "draft",

        index: true,
      },

      seoTitle: {
        type: String,
        default: "",
      },

      seoDescription: {
        type: String,
        default: "",
      },

      publishedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    },
  );

const Blog =
  mongoose.models.Blog ||
  mongoose.model(
    "Blog",
    BlogSchema,
  );

export default Blog;
import mongoose from "mongoose";

import Blog from "@/models/Blog";

const MONGODB_URI =
  process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI missing.",
  );
}

type Cache = {
  conn: typeof mongoose | null;
  promise:
    | Promise<typeof mongoose>
    | null;
};

const globalForBlog =
  globalThis as typeof globalThis & {
    blogMongoose?: Cache;
  };

const cached: Cache =
  globalForBlog.blogMongoose || {
    conn: null,
    promise: null,
  };

globalForBlog.blogMongoose =
  cached;

export async function connectBlogDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise =
      mongoose.connect(
        MONGODB_URI!,
      );
  }

  cached.conn =
    await cached.promise;

  return cached.conn;
}

export function createBlogSlug(
  value: string,
) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}

export async function getPublishedBlogs() {
  await connectBlogDB();

  return Blog.find({
    status:
      "published",
  })
    .sort({
      publishedAt: -1,
      createdAt: -1,
    })
    .lean();
}

export async function getPublishedBlogBySlug(
  slug: string,
) {
  await connectBlogDB();

  return Blog.findOne({
    slug,
    status:
      "published",
  }).lean();
}

export async function getAllBlogs() {
  await connectBlogDB();

  return Blog.find({})
    .sort({
      createdAt: -1,
    })
    .lean();
}

/*
 * ==========================================
 * BLOG ADMIN AUTH
 * ==========================================
 */

export async function requireBlogAdmin(
  request: Request,
) {
  try {
    const url =
      new URL(
        request.url,
      );

    const authUrl =
      `${url.origin}/api/auth/me`;

    const cookie =
      request.headers.get(
        "cookie",
      ) || "";

    const response =
      await fetch(
        authUrl,
        {
          method: "GET",

          headers: {
            cookie,
          },

          cache:
            "no-store",
        },
      );

    if (!response.ok) {
      console.error(
        "[BLOG_ADMIN] /api/auth/me failed:",
        response.status,
      );

      return false;
    }

    const data =
      await response.json();

    console.log(
      "[BLOG_ADMIN] auth response:",
      {
        authenticated:
          data?.authenticated,

        email:
          data?.user?.email,
      },
    );

    if (
      !data?.authenticated ||
      !data?.user
    ) {
      console.warn(
        "[BLOG_ADMIN] User not authenticated.",
      );

      return false;
    }

    const userEmail =
      String(
        data.user.email || "",
      )
        .trim()
        .toLowerCase();

    const adminEmail =
      String(
        process.env
          .KRINAY_ADMIN_EMAIL ||
          "",
      )
        .trim()
        .toLowerCase();

    console.log(
      "[BLOG_ADMIN] email compare:",
      {
        userEmail,
        adminEmail,
      },
    );

    if (!adminEmail) {
      console.error(
        "[BLOG_ADMIN] KRINAY_ADMIN_EMAIL missing.",
      );

      return false;
    }

    if (!userEmail) {
      console.error(
        "[BLOG_ADMIN] User email missing.",
      );

      return false;
    }

    return (
      userEmail ===
      adminEmail
    );
  } catch (error) {
    console.error(
      "[BLOG_ADMIN] Auth check error:",
      error,
    );

    return false;
  }
}
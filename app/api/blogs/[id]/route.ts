import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  revalidatePath,
} from "next/cache";

import Blog from "@/models/Blog";

import {
  connectBlogDB,
  createBlogSlug,
  requireBlogAdmin,
} from "@/lib/blog-utils";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: Context,
) {
  const allowed =
    await requireBlogAdmin(
      request,
    );

  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 401,
      },
    );
  }

  const { id } =
    await context.params;

  await connectBlogDB();

  const blog =
    await Blog.findById(
      id,
    ).lean();

  if (!blog) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Blog not found.",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    success: true,
    blog,
  });
}

export async function PATCH(
  request: NextRequest,
  context: Context,
) {
  try {
    const allowed =
      await requireBlogAdmin(
        request,
      );

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin access required.",
        },
        {
          status: 401,
        },
      );
    }

    const { id } =
      await context.params;

    await connectBlogDB();

    const blog =
      await Blog.findById(
        id,
      );

    if (!blog) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Blog not found.",
        },
        {
          status: 404,
        },
      );
    }

    const body =
      await request.json();

    const slug =
      createBlogSlug(
        body.slug ||
          body.title ||
          blog.title,
      );

    const duplicate =
      await Blog.findOne({
        slug,

        _id: {
          $ne:
            blog._id,
        },
      });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Slug already exists.",
        },
        {
          status: 409,
        },
      );
    }

    const oldSlug =
      blog.slug;

    const status =
      body.status ===
      "published"
        ? "published"
        : "draft";

    blog.title =
      String(
        body.title,
      );

    blog.slug =
      slug;

    blog.excerpt =
      String(
        body.excerpt,
      );

    blog.content =
      String(
        body.content,
      );

    blog.featuredImage =
      String(
        body.featuredImage ||
          "",
      );

    blog.imageAlt =
      String(
        body.imageAlt ||
          body.title,
      );

    blog.author =
      String(
        body.author ||
          "Krinay Editorial Team",
      );

    blog.category =
      String(
        body.category ||
          "Scrub Guide",
      );

    blog.tags =
      Array.isArray(
        body.tags,
      )
        ? body.tags
        : [];

    blog.seoTitle =
      String(
        body.seoTitle ||
          body.title,
      );

    blog.seoDescription =
      String(
        body.seoDescription ||
          body.excerpt,
      );

    if (
      status ===
        "published" &&
      blog.status !==
        "published"
    ) {
      blog.publishedAt =
        new Date();
    }

    if (
      status ===
      "draft"
    ) {
      blog.publishedAt =
        null;
    }

    blog.status =
      status;

    await blog.save();

    revalidatePath(
      "/blog",
    );

    revalidatePath(
      `/blog/${oldSlug}`,
    );

    revalidatePath(
      `/blog/${slug}`,
    );

    revalidatePath(
      "/sitemap.xml",
    );

    return NextResponse.json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error(
      "[BLOG_UPDATE]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Blog update failed.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: Context,
) {
  const allowed =
    await requireBlogAdmin(
      request,
    );

  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 401,
      },
    );
  }

  const { id } =
    await context.params;

  await connectBlogDB();

  const blog =
    await Blog.findByIdAndDelete(
      id,
    );

  if (!blog) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Blog not found.",
      },
      {
        status: 404,
      },
    );
  }

  revalidatePath(
    "/blog",
  );

  revalidatePath(
    `/blog/${blog.slug}`,
  );

  revalidatePath(
    "/sitemap.xml",
  );

  return NextResponse.json({
    success: true,
  });
}
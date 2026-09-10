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

export async function GET(
  request: NextRequest,
) {
  try {
    await connectBlogDB();

    const isAdminRequest =
      request.nextUrl.searchParams.get(
        "admin",
      ) === "1";

    if (isAdminRequest) {
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
    }

    const blogs =
      await Blog.find(
        isAdminRequest
          ? {}
          : {
              status:
                "published",
            },
      )
        .sort({
          publishedAt: -1,
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      blogs,
    });
  } catch (error) {
    console.error(
      "[BLOG_GET]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Blogs load failed.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: NextRequest,
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

    await connectBlogDB();

    const body =
      await request.json();

    const title =
      String(
        body.title || "",
      ).trim();

    const excerpt =
      String(
        body.excerpt || "",
      ).trim();

    const content =
      String(
        body.content || "",
      ).trim();

    if (
      !title ||
      !excerpt ||
      !content
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Title, excerpt and content are required.",
        },
        {
          status: 400,
        },
      );
    }

    const slug =
      createBlogSlug(
        body.slug ||
          title,
      );

    const existing =
      await Blog.findOne({
        slug,
      });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This blog slug already exists.",
        },
        {
          status: 409,
        },
      );
    }

    const status =
      body.status ===
      "published"
        ? "published"
        : "draft";

    const blog =
      await Blog.create({
        title,

        slug,

        excerpt,

        content,

        featuredImage:
          String(
            body.featuredImage ||
              "",
          ).trim(),

        imageAlt:
          String(
            body.imageAlt ||
              title,
          ).trim(),

        author:
          String(
            body.author ||
              "Krinay Editorial Team",
          ).trim(),

        category:
          String(
            body.category ||
              "Scrub Guide",
          ).trim(),

        tags:
          Array.isArray(
            body.tags,
          )
            ? body.tags
            : [],

        seoTitle:
          String(
            body.seoTitle ||
              title,
          ).trim(),

        seoDescription:
          String(
            body.seoDescription ||
              excerpt,
          ).trim(),

        status,

        publishedAt:
          status ===
          "published"
            ? new Date()
            : null,
      });

    revalidatePath(
      "/blog",
    );

    revalidatePath(
      `/blog/${slug}`,
    );

    revalidatePath(
      "/sitemap.xml",
    );

    return NextResponse.json(
      {
        success: true,
        blog,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "[BLOG_CREATE]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Blog create failed.",
      },
      {
        status: 500,
      },
    );
  }
}
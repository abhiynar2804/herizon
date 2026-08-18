import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { articleSchema } from "@/lib/validations/article";

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      response: NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      response: NextResponse.json(
        { message: "Forbidden" },
        { status: 403 },
      ),
    };
  }

  return { session };
}

export async function GET() {
  try {
    const auth = await requireAdmin();

    if ("response" in auth) {
      return auth.response;
    }

    const articles = await prisma.article.findMany({
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("GET /api/admin/articles error:", error);

    return NextResponse.json(
      { message: "Failed to fetch articles." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();

    if ("response" in auth) {
      return auth.response;
    }

    const body = await request.json();

    const result = articleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid article data.",
          errors: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const {
      categoryId,
      title,
      slug,
      summary,
      content,
      coverImage,
      status,
    } = result.data;

    const category = await prisma.articleCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Article category not found." },
        { status: 400 },
      );
    }

    const existingSlug = await prisma.article.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { message: "An article with this slug already exists." },
        { status: 409 },
      );
    }

    const articleStatus = status ?? "DRAFT";

    const article = await prisma.article.create({
      data: {
        categoryId,
        authorId: auth.session.user.id,
        title,
        slug,
        summary,
        content,
        coverImage,
        status: articleStatus,
        publishedAt:
          articleStatus === "PUBLISHED" ? new Date() : null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/articles error:", error);

    return NextResponse.json(
      { message: "Failed to create article." },
      { status: 500 },
    );
  }
}
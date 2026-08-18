import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { articleSchema } from "@/lib/validations/article";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const auth = await requireAdmin();

    if ("response" in auth) {
      return auth.response;
    }

    const { id } = await context.params;

    const article = await prisma.article.findUnique({
      where: { id },
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
    });

    if (!article) {
      return NextResponse.json(
        { message: "Article not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error(
      "GET /api/admin/articles/[id] error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to fetch article." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const auth = await requireAdmin();

    if ("response" in auth) {
      return auth.response;
    }

    const { id } = await context.params;
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

    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { message: "Article not found." },
        { status: 404 },
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

    const duplicateSlug = await prisma.article.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (duplicateSlug) {
      return NextResponse.json(
        { message: "An article with this slug already exists." },
        { status: 409 },
      );
    }

    const articleStatus = status ?? existingArticle.status;

    const article = await prisma.article.update({
      where: { id },
      data: {
        categoryId,
        title,
        slug,
        summary,
        content,
        coverImage,
        status: articleStatus,
        publishedAt:
          articleStatus === "PUBLISHED"
            ? existingArticle.publishedAt ?? new Date()
            : null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error(
      "PATCH /api/admin/articles/[id] error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to update article." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const auth = await requireAdmin();

    if ("response" in auth) {
      return auth.response;
    }

    const { id } = await context.params;

    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return NextResponse.json(
        { message: "Article not found." },
        { status: 404 },
      );
    }

    await prisma.article.update({
      where: { id },
      data: {
        status: "ARCHIVED",
      },
    });

    return NextResponse.json({
      message: "Article archived successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/articles/[id] error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to archive article." },
      { status: 500 },
    );
  }
}
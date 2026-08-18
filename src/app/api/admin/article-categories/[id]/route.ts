import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { articleCategorySchema } from "@/lib/validations/article";

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

    const result = articleCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid category data.",
          errors: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const existingCategory =
      await prisma.articleCategory.findUnique({
        where: { id },
      });

    if (!existingCategory) {
      return NextResponse.json(
        { message: "Article category not found." },
        { status: 404 },
      );
    }

    const { name, description } = result.data;

    const duplicate =
      await prisma.articleCategory.findFirst({
        where: {
          name,
          NOT: { id },
        },
      });

    if (duplicate) {
      return NextResponse.json(
        { message: "A category with this name already exists." },
        { status: 409 },
      );
    }

    const category = await prisma.articleCategory.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error(
      "PATCH /api/admin/article-categories/[id] error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to update article category." },
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

    const category =
      await prisma.articleCategory.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              articles: true,
            },
          },
        },
      });

    if (!category) {
      return NextResponse.json(
        { message: "Article category not found." },
        { status: 404 },
      );
    }

    if (category._count.articles > 0) {
      return NextResponse.json(
        {
          message:
            "Cannot delete a category that contains articles.",
        },
        { status: 409 },
      );
    }

    await prisma.articleCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Article category deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/article-categories/[id] error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to delete article category." },
      { status: 500 },
    );
  }
}
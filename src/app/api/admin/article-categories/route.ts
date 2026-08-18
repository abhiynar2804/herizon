import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { articleCategorySchema } from "@/lib/validations/article";

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

    const categories = await prisma.articleCategory.findMany({
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error(
      "GET /api/admin/article-categories error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to fetch article categories." },
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

    const { name, description } = result.data;

    const existingCategory =
      await prisma.articleCategory.findUnique({
        where: { name },
      });

    if (existingCategory) {
      return NextResponse.json(
        { message: "A category with this name already exists." },
        { status: 409 },
      );
    }

    const category = await prisma.articleCategory.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error(
      "POST /api/admin/article-categories error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to create article category." },
      { status: 500 },
    );
  }
}
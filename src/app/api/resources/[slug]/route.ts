import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { slug } = await context.params;

    const article = await prisma.article.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        content: true,
        coverImage: true,
        publishedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { message: "Resource not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error(
      "GET /api/resources/[slug] error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to fetch resource." },
      { status: 500 },
    );
  }
}
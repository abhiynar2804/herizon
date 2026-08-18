import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim();
    const categoryId = searchParams.get("categoryId")?.trim();

    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") ?? "1", 10) || 1,
    );

    const limit = Math.min(
      50,
      Math.max(
        1,
        Number.parseInt(searchParams.get("limit") ?? "10", 10) || 10,
      ),
    );

    const where = {
      status: "PUBLISHED" as const,

      ...(categoryId && {
        categoryId,
      }),

      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            summary: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            content: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    };

    const [articles, total] = await prisma.$transaction([
      prisma.article.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          coverImage: true,
          publishedAt: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      prisma.article.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("GET /api/resources error:", error);

    return NextResponse.json(
      { message: "Failed to fetch resources." },
      { status: 500 },
    );
  }
}
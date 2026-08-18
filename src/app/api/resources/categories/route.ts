import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.articleCategory.findMany({
      where: {
        articles: {
          some: {
            status: "PUBLISHED",
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error(
      "GET /api/resources/categories error:",
      error,
    );

    return NextResponse.json(
      { message: "Failed to fetch resource categories." },
      { status: 500 },
    );
  }
}
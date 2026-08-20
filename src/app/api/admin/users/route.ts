import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();

    if ("response" in auth) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim();
    const role = searchParams.get("role");

    const users = await prisma.user.findMany({
      where: {
        ...(search && {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }),

        ...(role &&
          ["USER", "PARTNER", "ADMIN"].includes(role) && {
            role: role as "USER" | "PARTNER" | "ADMIN",
          }),
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/admin/users error:", error);

    return NextResponse.json(
      { message: "Failed to fetch users." },
      { status: 500 },
    );
  }
}
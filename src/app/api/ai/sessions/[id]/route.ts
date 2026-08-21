import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { message: "Chat session not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ session: chatSession });
  } catch (error) {
    console.error("AI session GET error:", error);

    return NextResponse.json(
      { message: "Unable to load chat session." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { message: "Chat session not found." },
        { status: 404 }
      );
    }

    await prisma.chatSession.delete({
      where: {
        id: chatSession.id,
      },
    });

    return NextResponse.json({
      message: "Chat session deleted successfully.",
    });
  } catch (error) {
    console.error("AI session DELETE error:", error);

    return NextResponse.json(
      { message: "Unable to delete chat session." },
      { status: 500 }
    );
  }
}
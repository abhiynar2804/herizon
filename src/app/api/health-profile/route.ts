import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { healthProfileSchema } from "@/lib/validations/health-profile";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const healthProfile = await prisma.healthProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!healthProfile) {
      return NextResponse.json(
        { message: "Health profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { healthProfile },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get health profile error:", error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const validation = healthProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid health profile data.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const existingProfile = await prisma.healthProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (existingProfile) {
      return NextResponse.json(
        { message: "Health profile already exists." },
        { status: 409 }
      );
    }

    const healthProfile = await prisma.healthProfile.create({
      data: {
        userId: session.user.id,
        ...validation.data,
      },
    });

    return NextResponse.json(
      {
        message: "Health profile created successfully.",
        healthProfile,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create health profile error:", error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const validation = healthProfileSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid health profile data.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const existingProfile = await prisma.healthProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { message: "Health profile not found." },
        { status: 404 }
      );
    }

    const updatedProfile = await prisma.healthProfile.update({
      where: {
        userId: session.user.id,
      },
      data: validation.data,
    });

    return NextResponse.json(
      {
        message: "Health profile updated successfully.",
        healthProfile: updatedProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update health profile error:", error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
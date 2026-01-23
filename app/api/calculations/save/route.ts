import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const saveCalculationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["PAYE", "REDUNDANCY", "RENTAL", "CONTRACTOR", "FULL_RETURN"]),
  data: z.object({}).passthrough(), // Allow any object structure
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has premium access
    if (
      session.user.subscriptionTier === "FREE" ||
      session.user.subscriptionStatus !== "active"
    ) {
      return NextResponse.json(
        { error: "Premium subscription required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, type, data } = saveCalculationSchema.parse(body);

    // Check saved calculation limit
    const count = await prisma.savedCalculation.count({
      where: { userId: session.user.id },
    });

    const maxCalculations =
      session.user.subscriptionTier === "PROFESSIONAL" ? 999 : 10;

    if (count >= maxCalculations) {
      return NextResponse.json(
        {
          error: `Maximum of ${maxCalculations} saved calculations reached`,
        },
        { status: 400 }
      );
    }

    // Save calculation
    const calculation = await prisma.savedCalculation.create({
      data: {
        userId: session.user.id,
        name,
        type,
        data: JSON.stringify(data),
      },
    });

    return NextResponse.json({
      id: calculation.id,
      name: calculation.name,
      type: calculation.type,
      createdAt: calculation.createdAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Save calculation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const calculations = await prisma.savedCalculation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ calculations });
  } catch (error) {
    console.error("Get calculations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const calculation = await prisma.savedCalculation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!calculation) {
      return NextResponse.json(
        { error: "Calculation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: calculation.id,
      name: calculation.name,
      type: calculation.type,
      data: JSON.parse(calculation.data),
      createdAt: calculation.createdAt,
      updatedAt: calculation.updatedAt,
    });
  } catch (error) {
    console.error("Get calculation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const calculation = await prisma.savedCalculation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!calculation) {
      return NextResponse.json(
        { error: "Calculation not found" },
        { status: 404 }
      );
    }

    await prisma.savedCalculation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete calculation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

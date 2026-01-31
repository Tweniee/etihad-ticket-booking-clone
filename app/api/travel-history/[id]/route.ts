import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateTravelHistorySchema } from "@/lib/validation/auth";

// GET single travel history entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const travelId = parseInt(id, 10);

    if (isNaN(travelId)) {
      return NextResponse.json(
        { error: "Invalid travel history ID" },
        { status: 400 },
      );
    }

    const travelHistory = await prisma.travelHistory.findUnique({
      where: { id: travelId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            category: true,
            citizenship: true,
          },
        },
      },
    });

    if (!travelHistory) {
      return NextResponse.json(
        { error: "Travel history not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ travelHistory });
  } catch (error) {
    console.error("Get travel history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT update travel history entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const travelId = parseInt(id, 10);

    if (isNaN(travelId)) {
      return NextResponse.json(
        { error: "Invalid travel history ID" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const result = updateTravelHistorySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 },
      );
    }

    const existingRecord = await prisma.travelHistory.findUnique({
      where: { id: travelId },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Travel history not found" },
        { status: 404 },
      );
    }

    const updateData: Record<string, unknown> = {};
    if (result.data.destination) updateData.destination = result.data.destination;
    if (result.data.travelDate) updateData.travelDate = new Date(result.data.travelDate);
    if (result.data.purpose !== undefined) updateData.purpose = result.data.purpose;

    const travelHistory = await prisma.travelHistory.update({
      where: { id: travelId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json({ travelHistory });
  } catch (error) {
    console.error("Update travel history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE travel history entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const travelId = parseInt(id, 10);

    if (isNaN(travelId)) {
      return NextResponse.json(
        { error: "Invalid travel history ID" },
        { status: 400 },
      );
    }

    const existingRecord = await prisma.travelHistory.findUnique({
      where: { id: travelId },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Travel history not found" },
        { status: 404 },
      );
    }

    await prisma.travelHistory.delete({
      where: { id: travelId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete travel history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

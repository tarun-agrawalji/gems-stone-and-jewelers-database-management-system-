import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLedgerEntry } from "@/lib/statusEngine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = search
      ? {
          OR: [
            { subLot: { lot: { lotNo: { contains: search } } } },
            { subLot: { subLotNo: { contains: search } } },
            { issuedTo: { contains: search } },
          ],
        }
      : {};

    const [manufacturing, total] = await Promise.all([
      prisma.manufacturing.findMany({
        where,
        include: { subLot: { include: { lot: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.manufacturing.count({ where }),
    ]);

    return NextResponse.json({ manufacturing, total, page, limit });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      subLotId, date, issuedTo, weight, weightUnit, entryType,
      pieces, shape, size, lines, length, labourCost, otherCost,
      selectionWeight, selectionPieces, selectionShape, selectionSize, selectionLines, selectionLength,
      rejectionWeight, rejectionPieces, rejectionLines, rejectionLength, returnToManufacturer, returnDate,
    } = body;

    const totalManufacturingCost = (labourCost || 0) + (otherCost || 0);

    const mfg = await prisma.manufacturing.create({
      data: {
        subLotId,
        date: new Date(date),
        entryType: entryType || "ISSUED",
        issuedTo,
        weight,
        weightUnit,
        pieces,
        shape,
        size,
        lines,
        length,
        labourCost: labourCost || 0,
        otherCost: otherCost || 0,
        totalManufacturingCost,
        selectionWeight,
        selectionPieces,
        selectionShape,
        selectionSize,
        selectionLines,
        selectionLength,
        rejectionWeight,
        rejectionPieces,
        rejectionLines,
        rejectionLength,
        returnToManufacturer,
        returnDate: returnDate ? new Date(returnDate) : null,
        status: "IN_PROCESS",
      },
      include: { subLot: { include: { lot: true } } },
    });

    // Update sublot status
    await prisma.subLot.update({
      where: { id: subLotId },
      data: { status: entryType === "RECEIVED" ? "READY" : "IN_PROCESS" },
    });

    await createLedgerEntry({
      lotId: mfg.subLot.lotId,
      subLotId,
      fromLocation: entryType === "RECEIVED" ? "Manufacturing" : "Stock",
      toLocation: entryType === "RECEIVED" ? "Stock" : "Manufacturing",
      weight,
      weightUnit,
      pieces,
      referenceType: "MANUFACTURING",
      referenceId: mfg.id,
    });

    return NextResponse.json({ manufacturing: mfg }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create manufacturing entry" }, { status: 500 });
  }
}

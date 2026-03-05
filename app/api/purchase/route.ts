import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLedgerEntry } from "@/lib/statusEngine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const where = search
      ? {
          OR: [
            { lot: { lotNo: { contains: search } } },
            { supplierName: { contains: search } },
            { itemName: { contains: search } },
          ],
        }
      : {};

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        include: { lot: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.purchase.count({ where }),
    ]);

    return NextResponse.json({ purchases, total, page, limit });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      lotNo, date, itemName, category, supplierName, descriptionRef,
      grossWeight, lessWeight, weightUnit, size, shape, lines, lineLength,
      pieces, purchasePrice, rejectionDate, rejectionStatus,
      selectionWeight, selectionPieces, selectionLines, selectionLength,
      rejectionWeight, rejectionPieces, rejectionLines, rejectionLength,
    } = body;

    const netWeight = grossWeight - (lessWeight || 0);
    const netWeightInGrams = weightUnit === "KG" ? netWeight * 1000 : weightUnit === "CT" ? netWeight * 0.2 : netWeight;
    const costPerGram = netWeightInGrams > 0 ? purchasePrice / netWeightInGrams : 0;
    const totalCost = purchasePrice;

    // Create or get lot
    let lot = await prisma.lot.findUnique({ where: { lotNo } });
    if (!lot) {
      lot = await prisma.lot.create({
        data: { lotNo, itemName, category, supplierName, description: descriptionRef },
      });
    }

    // Create sub lot for tracking
    const isRejected = !!rejectionDate;
    const subLot = await prisma.subLot.create({
      data: {
        subLotNo: `${lotNo}-A`,
        lotId: lot.id,
        weight: netWeight,
        weightUnit,
        pieces,
        shape,
        size,
        lines,
        length: lineLength,
        status: isRejected ? "RETURNED" : "IN_STOCK",
      },
    });

    const purchase = await prisma.purchase.create({
      data: {
        lotId: lot.id,
        date: new Date(date),
        itemName,
        supplierName,
        descriptionRef,
        grossWeight,
        lessWeight: lessWeight || 0,
        netWeight,
        weightUnit,
        size,
        shape,
        lines,
        lineLength,
        pieces,
        purchasePrice,
        costPerGram,
        totalCost,
        selectionWeight,
        selectionPieces,
        selectionLines,
        selectionLength,
        rejectionWeight,
        rejectionPieces,
        rejectionLines,
        rejectionLength,
        rejectionDate: rejectionDate ? new Date(rejectionDate) : null,
        rejectionStatus: rejectionStatus || "PENDING",
      },
      include: { lot: true },
    });

    await createLedgerEntry({
      lotId: lot.id,
      subLotId: subLot.id,
      fromLocation: "Supplier",
      toLocation: isRejected ? "Rejection" : "Stock",
      weight: netWeight,
      weightUnit,
      pieces,
      referenceType: isRejected ? "PURCHASE_REJECTED" : "PURCHASE",
      referenceId: purchase.id,
    });

    return NextResponse.json({ purchase, subLot }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 });
  }
}

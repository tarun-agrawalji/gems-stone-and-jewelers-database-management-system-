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
            { soldTo: { contains: search } },
            { billNo: { contains: search } },
          ],
        }
      : {};

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: { subLot: { include: { lot: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sale.count({ where }),
    ]);

    return NextResponse.json({ sales, total, page, limit });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      subLotId, date, soldTo, salePrice, discount, tax, billNo,
      itemName, descriptionRef,
      weight, weightUnit, size, shape, pieces, lines, length,
      returnedWeight, returnedPieces, returnedLines, returnedLength, returnDate
    } = body;

    const netSale = salePrice - (discount || 0);
    const finalBillAmount = netSale + (tax || 0);

    // Get purchase cost for profit calculation
    const subLot = await prisma.subLot.findUnique({
      where: { id: subLotId },
      include: {
        lot: { include: { purchases: true } },
        manufacturing: true,
      },
    });
    
    if (!subLot) {
      return NextResponse.json({ error: "Sublot not found" }, { status: 404 });
    }

    // Determine Sale status based on returned items
    let status = "SOLD";
    if (returnedWeight && returnedWeight > 0) {
      status = (returnedWeight >= (weight || subLot.weight)) ? "RETURNED" : "PARTIALLY_RETURNED";
    }

    const sale = await prisma.sale.create({
      data: {
        subLotId,
        date: new Date(date),
        soldTo,
        salePrice,
        discount: discount || 0,
        netSale,
        tax: tax || 0,
        finalBillAmount,
        billNo,
        itemName,
        descriptionRef,
        weight: weight || subLot.weight,
        weightUnit: weightUnit || subLot.weightUnit,
        size,
        shape,
        pieces,
        lines,
        length,
        returnedWeight,
        returnedPieces,
        returnedLines,
        returnedLength,
        returnDate: returnDate ? new Date(returnDate) : null,
        status: status as any,
      },
      include: { subLot: { include: { lot: true } } },
    });

    // Update sublot status
    // if everything returned, back to READY. If partially returned, PARTIALLY_SOLD. Else CLOSED.
    let newSubLotStatus = "CLOSED";
    if (status === "RETURNED") {
      newSubLotStatus = "READY";
    } else if (status === "PARTIALLY_RETURNED") {
      newSubLotStatus = "PARTIALLY_SOLD";
    }

    await prisma.subLot.update({
      where: { id: subLotId },
      data: { status: newSubLotStatus as any },
    });

    const saleWeight = weight || subLot.weight;
    const salePieces = pieces !== undefined ? pieces : (subLot.pieces || undefined);
    
    // Regular sale ledger entry
    await createLedgerEntry({
      lotId: sale.subLot.lotId,
      subLotId,
      fromLocation: "Ready Goods",
      toLocation: "Sales",
      weight: saleWeight,
      weightUnit: sale.weightUnit,
      pieces: salePieces,
      referenceType: "SALE",
      referenceId: sale.id,
    });
    
    // If there's a return, make a reverse ledger entry
    if (returnedWeight && returnedWeight > 0) {
       await createLedgerEntry({
         lotId: sale.subLot.lotId,
         subLotId,
         fromLocation: "Sales",  
         toLocation: "Ready Goods",
         weight: returnedWeight,
         weightUnit: sale.weightUnit,
         pieces: returnedPieces || undefined,
         referenceType: "SALE_RETURN",
         referenceId: sale.id,
         notes: "Customer Return"
       });
    }

    return NextResponse.json({ sale }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { subLotNo: { contains: search } },
        { lot: { lotNo: { contains: search } } },
      ];
    }

    const subLots = await prisma.subLot.findMany({
      where,
      include: { lot: true, parentSubLot: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ subLots });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Split a sublot
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { parentSubLotId, splits } = body;
    // splits: [{subLotNo, weight, pieces, weightUnit}]

    const parent = await prisma.subLot.findUnique({ where: { id: parentSubLotId } });
    if (!parent) return NextResponse.json({ error: "Parent sublot not found" }, { status: 404 });

    const totalSplitWeight = splits.reduce((s: number, sp: any) => s + sp.weight, 0);
    if (totalSplitWeight > parent.weight) {
      return NextResponse.json({ error: "Split weight exceeds parent weight" }, { status: 400 });
    }

    const created = await Promise.all(
      splits.map((sp: any) =>
        prisma.subLot.create({
          data: {
            subLotNo: sp.subLotNo,
            lotId: parent.lotId,
            parentSubLotId: parent.id,
            weight: sp.weight,
            weightUnit: sp.weightUnit || parent.weightUnit,
            pieces: sp.pieces,
            shape: parent.shape,
            size: parent.size,
            status: "IN_STOCK",
          },
        })
      )
    );

    return NextResponse.json({ subLots: created }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to split sublot" }, { status: 500 });
  }
}

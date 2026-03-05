import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lotId = searchParams.get("lotId");
    const subLotId = searchParams.get("subLotId");
    const refType = searchParams.get("referenceType");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};
    if (lotId) where.lotId = lotId;
    if (subLotId) where.subLotId = subLotId;
    if (refType) where.referenceType = refType;

    const [entries, total] = await Promise.all([
      prisma.stockLedger.findMany({
        where,
        include: {
          lot: true,
          subLot: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.stockLedger.count({ where }),
    ]);

    return NextResponse.json({ entries, total, page, limit });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch ledger" }, { status: 500 });
  }
}

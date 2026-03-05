import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lotNo = searchParams.get("lotNo");
    const subLotNo = searchParams.get("subLotNo");

    if (!lotNo && !subLotNo) {
      return NextResponse.json({ error: "Provide lotNo or subLotNo" }, { status: 400 });
    }

    let targetSubLots: any[] = [];

    if (lotNo) {
      const lot = await prisma.lot.findUnique({
        where: { lotNo },
        include: {
          purchases: true,
          subLots: {
            include: {
              manufacturing: { orderBy: { createdAt: "asc" } },
              sales: { orderBy: { createdAt: "asc" } },
              childSubLots: true,
              parentSubLot: true,
            },
          },
        },
      });
      if (!lot) return NextResponse.json({ error: "Lot not found" }, { status: 404 });

      // Calculate profit for each sublot
      const subLotsWithProfit = await Promise.all(
        lot.subLots.map(async (sl) => {
          const purchaseCost = lot.purchases.reduce((s, p) => s + p.totalCost, 0);
          const mfgCost = sl.manufacturing.reduce((s, m) => s + m.totalManufacturingCost, 0);
          const totalCost = purchaseCost + mfgCost;
          const totalSales = sl.sales.reduce((s, sale) => s + sale.finalBillAmount, 0);
          const profit = totalSales - totalCost;
          return { ...sl, totalCost, totalSales, profit };
        })
      );

      return NextResponse.json({ lot, subLots: subLotsWithProfit });
    }

    // SubLot search
    const subLot = await prisma.subLot.findFirst({
      where: { subLotNo: { contains: subLotNo || "" } },
      include: {
        lot: { include: { purchases: true } },
        manufacturing: { orderBy: { createdAt: "asc" } },
        sales: { orderBy: { createdAt: "asc" } },
        childSubLots: true,
        parentSubLot: true,
      },
    });

    if (!subLot) return NextResponse.json({ error: "Sub lot not found" }, { status: 404 });

    const purchaseCost = subLot.lot.purchases.reduce((s, p) => s + p.totalCost, 0);
    const mfgCost = subLot.manufacturing.reduce((s, m) => s + m.totalManufacturingCost, 0);
    const totalCost = purchaseCost + mfgCost;
    const totalSales = subLot.sales.reduce((s, sale) => s + sale.finalBillAmount, 0);
    const profit = totalSales - totalCost;

    return NextResponse.json({ subLot: { ...subLot, totalCost, totalSales, profit } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch product history" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalLots,
      totalSubLots,
      totalPurchases,
      totalSales,
      subLotsByStatus,
      recentLedger,
      purchaseAmount,
      saleAmount,
    ] = await Promise.all([
      prisma.lot.count(),
      prisma.subLot.count(),
      prisma.purchase.count(),
      prisma.sale.count(),
      prisma.subLot.groupBy({ by: ["status"], _count: true }),
      prisma.stockLedger.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { lot: true, subLot: true },
      }),
      prisma.purchase.aggregate({ _sum: { totalCost: true } }),
      prisma.sale.aggregate({ _sum: { finalBillAmount: true } }),
    ]);

    const pendingRejections = await prisma.purchase.count({
      where: { rejectionDate: { not: null }, rejectionStatus: "PENDING" },
    });

    const mfgRejectionPending = await prisma.manufacturing.count({
      where: { status: "REJECTED", returnToManufacturer: false },
    });

    const stats = {
      totalLots,
      totalSubLots,
      totalPurchases,
      totalSales,
      subLotsByStatus,
      recentLedger,
      totalPurchaseValue: purchaseAmount._sum.totalCost || 0,
      totalSaleValue: saleAmount._sum.finalBillAmount || 0,
      pendingRejections: pendingRejections + mfgRejectionPending,
    };

    return NextResponse.json(stats);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}

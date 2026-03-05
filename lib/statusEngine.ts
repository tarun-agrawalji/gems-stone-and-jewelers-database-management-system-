import { prisma } from "./prisma";

export async function computeSubLotStatus(subLotId: string): Promise<string> {
  const subLot = await prisma.subLot.findUnique({
    where: { id: subLotId },
    include: {
      manufacturing: { orderBy: { createdAt: "desc" } },
      sales: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!subLot) return "IN_STOCK";

  const latestMfg = subLot.manufacturing[0];
  const latestSale = subLot.sales[0];

  // Check if returned to manufacturer
  if (latestMfg?.status === "RETURNED_TO_MANUFACTURER") return "CLOSED_RETURNED";

  // Check rejection pending
  if (latestMfg?.status === "REJECTED" && !latestMfg.returnToManufacturer) return "PENDING";

  // Check sales
  if (latestSale) {
    if (latestSale.status === "RETURNED") return "RETURNED";
    if (latestSale.returnDate) return "RETURNED";
  }

  // Check all sales vs weight
  const totalSold = subLot.sales
    .filter((s) => s.status !== "RETURNED")
    .reduce((sum, s) => sum + (s.returnedWeight ?? 0), 0);

  if (subLot.sales.length > 0) {
    const hasFullSale = subLot.sales.some((s) => s.returnedWeight == null || s.returnedWeight === 0);
    if (hasFullSale) return "CLOSED";
    return "PARTIALLY_SOLD";
  }

  // Check manufacturing
  if (latestMfg) {
    if (latestMfg.status === "COMPLETED") return "READY";
    if (latestMfg.status === "IN_PROCESS") return "IN_PROCESS";
  }

  return "IN_STOCK";
}

export async function createLedgerEntry(data: {
  lotId?: string;
  subLotId?: string;
  fromLocation: string;
  toLocation: string;
  weight: number;
  weightUnit: string;
  pieces?: number;
  referenceType: string;
  referenceId: string;
  notes?: string;
}) {
  return prisma.stockLedger.create({
    data: {
      date: new Date(),
      lotId: data.lotId,
      subLotId: data.subLotId,
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      weight: data.weight,
      weightUnit: data.weightUnit as any,
      pieces: data.pieces,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      notes: data.notes,
    },
  });
}

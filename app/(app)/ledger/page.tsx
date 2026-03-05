"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Search, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

type LedgerEntry = {
  id: string;
  date: string;
  lot: { lotNo: string } | null;
  subLot: { subLotNo: string } | null;
  fromLocation: string;
  toLocation: string;
  weight: number;
  weightUnit: string;
  pieces: number | null;
  referenceType: string;
  notes: string | null;
};

const REF_TYPE_COLORS: Record<string, string> = {
  PURCHASE: "bg-blue-500/20 text-blue-400",
  MANUFACTURING: "bg-amber-500/20 text-amber-400",
  SALE: "bg-emerald-500/20 text-emerald-400",
  RETURN: "bg-cyan-500/20 text-cyan-400",
  SPLIT: "bg-violet-500/20 text-violet-400",
};

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refType, setRefType] = useState("");

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (refType) params.set("referenceType", refType);
    const r = await fetch(`/api/ledger?${params}`);
    const data = await r.json();
    setEntries(data.entries || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [refType]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> Stock Movement Ledger
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Complete audit trail of all stock movements · {total} entries</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select value={refType} onChange={(e) => setRefType(e.target.value)} className="input-field w-48">
          <option value="">All Types</option>
          <option value="PURCHASE">Purchase</option>
          <option value="MANUFACTURING">Manufacturing</option>
          <option value="SALE">Sale</option>
          <option value="RETURN">Return</option>
          <option value="SPLIT">Split</option>
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Date</th><th>Lot No</th><th>Sub Lot</th>
                <th>From</th><th>To</th><th>Weight</th>
                <th>Pieces</th><th>Type</th><th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">No ledger entries yet. Ledger is auto-populated on transactions.</td></tr>
              ) : entries.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap">{formatDate(e.date)}</td>
                  <td><span className="font-mono text-primary font-medium">{e.lot?.lotNo || "—"}</span></td>
                  <td><span className="font-mono text-sm">{e.subLot?.subLotNo || "—"}</span></td>
                  <td><span className="text-muted-foreground">{e.fromLocation}</span></td>
                  <td className="font-medium">{e.toLocation}</td>
                  <td>{e.weight} {e.weightUnit}</td>
                  <td>{e.pieces || "—"}</td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${REF_TYPE_COLORS[e.referenceType] || "bg-gray-500/20 text-gray-400"}`}>
                      {e.referenceType}
                    </span>
                  </td>
                  <td className="text-muted-foreground text-xs">{e.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

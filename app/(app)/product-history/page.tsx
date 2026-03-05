"use client";

import { useState } from "react";
import { History, Search, Loader2, Package, Wrench, TrendingUp, GitBranch } from "lucide-react";
import { formatINR, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

export default function ProductHistoryPage() {
  const [searchType, setSearchType] = useState<"lot" | "sublot">("lot");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const params = searchType === "lot" ? `lotNo=${encodeURIComponent(query)}` : `subLotNo=${encodeURIComponent(query)}`;
    const r = await fetch(`/api/product-history?${params}`);
    setLoading(false);
    if (r.ok) {
      const data = await r.json();
      setResult(data);
    } else {
      const d = await r.json();
      setError(d.error || "Not found");
      setResult(null);
    }
  }

  const subLot = result?.subLot;
  const lot = result?.lot;
  const subLots = result?.subLots || (subLot ? [subLot] : []);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <History className="w-6 h-6 text-primary" /> Product History
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Full lifecycle view — purchase to sale</p>
      </div>

      {/* Search */}
      <div className="glass-card p-5">
        <form onSubmit={handleSearch} className="flex items-end gap-3">
          <div className="w-40">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Search By</label>
            <select value={searchType} onChange={(e) => setSearchType(e.target.value as "lot" | "sublot")} className="input-field">
              <option value="lot">Lot No</option>
              <option value="sublot">Sub Lot No</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              {searchType === "lot" ? "Lot Number" : "Sub Lot Number"}
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchType === "lot" ? "e.g. LOT-101" : "e.g. LOT-101-A"}
              required
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="gem-gradient text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </form>
        {error && <p className="text-destructive text-sm mt-3">⚠ {error}</p>}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Lot Header */}
          {lot && (
            <div className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Lot Details</p>
                  <h2 className="text-2xl font-bold font-mono text-primary">{lot.lotNo}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{lot.itemName || "—"} · {lot.supplierName || "—"}</p>
                </div>
                <span className="text-xs bg-secondary px-3 py-1.5 rounded-full">{lot.category}</span>
              </div>
            </div>
          )}

          {subLots.map((sl: any) => (
            <div key={sl.id} className="glass-card p-5 space-y-4">
              {/* Sub Lot Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sub Lot</p>
                  <h3 className="text-xl font-bold font-mono">{sl.subLotNo}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{sl.weight} {sl.weightUnit} · {sl.pieces || "—"} pcs</p>
                </div>
                <span className={`status-badge ${getStatusColor(sl.status)}`}>{getStatusLabel(sl.status)}</span>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/40 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
                  <p className="font-bold text-amber-400">{formatINR(sl.totalCost || 0)}</p>
                </div>
                <div className="bg-secondary/40 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Total Sales</p>
                  <p className="font-bold text-blue-400">{formatINR(sl.totalSales || 0)}</p>
                </div>
                <div className="bg-secondary/40 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
                  <p className={`font-bold ${(sl.profit || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {formatINR(sl.profit || 0)}
                  </p>
                </div>
              </div>

              {/* Manufacturing */}
              {sl.manufacturing?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <Wrench className="w-4 h-4 text-amber-400" /> Manufacturing ({sl.manufacturing.length})
                  </h4>
                  {sl.manufacturing.map((m: any) => (
                    <div key={m.id} className="text-sm text-muted-foreground ml-6 py-1 border-l border-border pl-3">
                      {formatDate(m.date)} · Issued to {m.issuedTo || "—"} · Mfg Cost: {formatINR(m.totalManufacturingCost)} · Status: {m.status}
                    </div>
                  ))}
                </div>
              )}

              {/* Sales */}
              {sl.sales?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Sales ({sl.sales.length})
                  </h4>
                  {sl.sales.map((s: any) => (
                    <div key={s.id} className="text-sm text-muted-foreground ml-6 py-1 border-l border-border pl-3">
                      {formatDate(s.date)} · Sold to {s.soldTo || "—"} · Bill: {s.billNo || "—"} · Final: {formatINR(s.finalBillAmount)}
                    </div>
                  ))}
                </div>
              )}

              {/* Child Sub Lots */}
              {sl.childSubLots?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <GitBranch className="w-4 h-4 text-violet-400" /> Split Sub Lots ({sl.childSubLots.length})
                  </h4>
                  {sl.childSubLots.map((c: any) => (
                    <div key={c.id} className="text-sm ml-6 py-1 border-l border-violet-500/30 pl-3">
                      <span className="font-mono text-primary">{c.subLotNo}</span>
                      <span className="text-muted-foreground"> · {c.weight} {c.weightUnit}</span>
                      <span className={`ml-2 status-badge ${getStatusColor(c.status)}`}>{getStatusLabel(c.status)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

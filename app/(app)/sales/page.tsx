"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, TrendingUp, Loader2, X, AlertCircle } from "lucide-react";
import { formatINR, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

type Sale = {
  id: string;
  subLot: { subLotNo: string; lot: { lotNo: string }; status: string };
  date: string;
  soldTo: string;
  salePrice: number;
  discount: number;
  netSale: number;
  tax: number;
  finalBillAmount: number;
  billNo: string;
  status: string;
};

type SubLot = { id: string; subLotNo: string; lot: { lotNo: string }; weight: number; weightUnit: string };

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [subLots, setSubLots] = useState<SubLot[]>([]);

  const [form, setForm] = useState({
    subLotId: "", date: new Date().toISOString().slice(0, 10), soldTo: "",
    salePrice: "", discount: "0", tax: "0", billNo: "",
    itemName: "", descriptionRef: "",
    weight: "", weightUnit: "G", size: "", shape: "", pieces: "", lines: "", length: "",
    returnedWeight: "", returnedPieces: "", returnedLines: "", returnedLength: "", returnDate: "",
    isReturn: false
  });

  const fetchSales = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/sales?search=${search}`);
    const data = await r.json();
    setSales(data.sales || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  useEffect(() => {
    if (showForm) {
      fetch("/api/sublots?status=READY")
        .then((r) => r.json())
        .then((d) => setSubLots(d.subLots || []));
    }
  }, [showForm]);

  const netSale = parseFloat(form.salePrice || "0") - parseFloat(form.discount || "0");
  const finalBill = netSale + parseFloat(form.tax || "0");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      ...form,
      salePrice: parseFloat(form.salePrice),
      discount: parseFloat(form.discount || "0"),
      tax: parseFloat(form.tax || "0"),
      weight: form.weight ? parseFloat(form.weight) : undefined,
      pieces: form.pieces ? parseInt(form.pieces) : undefined,
      lines: form.lines ? parseInt(form.lines) : undefined,
      length: form.length ? parseFloat(form.length) : undefined,
      returnedWeight: form.returnedWeight && form.isReturn ? parseFloat(form.returnedWeight) : undefined,
      returnedPieces: form.returnedPieces && form.isReturn ? parseInt(form.returnedPieces) : undefined,
      returnedLines: form.returnedLines && form.isReturn ? parseInt(form.returnedLines) : undefined,
      returnedLength: form.returnedLength && form.isReturn ? parseFloat(form.returnedLength) : undefined,
      returnDate: form.returnDate && form.isReturn ? form.returnDate : undefined,
    };
    
    const r = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (r.ok) {
      setShowForm(false);
      fetchSales();
    } else {
      const d = await r.json();
      setError(d.error || "Failed to save");
    }
  }

  const f = (k: string, v: string | boolean) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> Sales
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{total} total records</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 gem-gradient text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Sale
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lot, customer, bill no..." className="input-field pl-9" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Lot No</th><th>Sub Lot</th><th>Date</th><th>Sold To</th>
                <th>Sale Price</th><th>Discount</th><th>Net Sale</th>
                <th>Tax</th><th>Final Bill</th><th>Bill No</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-12 text-muted-foreground">No sales yet.</td></tr>
              ) : sales.map((s) => (
                <tr key={s.id}>
                  <td><span className="font-mono text-primary font-medium">{s.subLot.lot.lotNo}</span></td>
                  <td><span className="font-mono text-sm">{s.subLot.subLotNo}</span></td>
                  <td>{formatDate(s.date)}</td>
                  <td>{s.soldTo || "—"}</td>
                  <td>{formatINR(s.salePrice)}</td>
                  <td className="text-red-400">{s.discount > 0 ? `-${formatINR(s.discount)}` : "—"}</td>
                  <td>{formatINR(s.netSale)}</td>
                  <td>{s.tax > 0 ? formatINR(s.tax) : "—"}</td>
                  <td className="font-bold text-emerald-400">{formatINR(s.finalBillAmount)}</td>
                  <td>{s.billNo || "—"}</td>
                  <td><span className={`status-badge ${getStatusColor(s.subLot.status)}`}>{getStatusLabel(s.subLot.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">New Sale Entry</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"><AlertCircle className="w-4 h-4 mt-0.5" />{error}</div>}

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Select Sub Lot (Ready Goods) *</label>
                  <select required value={form.subLotId} onChange={(e) => f("subLotId", e.target.value)} className="input-field">
                    <option value="">— Select a Ready Sub Lot —</option>
                    {subLots.map((sl) => (
                      <option key={sl.id} value={sl.id}>{sl.lot.lotNo} → {sl.subLotNo} ({sl.weight} {sl.weightUnit})</option>
                    ))}
                  </select>
                  {subLots.length === 0 && <p className="text-xs text-amber-400 mt-1">⚠ No READY sub-lots. Mark manufacturing as complete first.</p>}
                </div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Date *</label>
                  <input required type="date" value={form.date} onChange={(e) => f("date", e.target.value as string)} className="input-field" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1.5">Sold To</label>
                  <input value={form.soldTo} onChange={(e) => f("soldTo", e.target.value)} placeholder="Customer name" className="input-field" /></div>
              </div>

              <div className="col-span-2 border-t border-b border-border py-4 mb-2">
                 <p className="text-xs font-semibold uppercase tracking-wider mb-3">Item Details</p>
                 <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Item Name</label>
                      <input value={form.itemName} onChange={(e) => f("itemName", e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description Reference</label>
                      <input value={form.descriptionRef} onChange={(e) => f("descriptionRef", e.target.value)} className="input-field" />
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Weight</label>
                      <input type="number" step="0.001" value={form.weight} onChange={(e) => f("weight", e.target.value)} placeholder="Auto from Sublot" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Unit</label>
                      <select value={form.weightUnit} onChange={(e) => f("weightUnit", e.target.value)} className="input-field">
                         <option>G</option><option>KG</option><option>CT</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Pieces</label>
                      <input type="number" value={form.pieces} onChange={(e) => f("pieces", e.target.value)} className="input-field" />
                    </div>
                 </div>
                 <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Shape</label>
                      <input value={form.shape} onChange={(e) => f("shape", e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Size</label>
                      <input value={form.size} onChange={(e) => f("size", e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Lines</label>
                      <input type="number" value={form.lines} onChange={(e) => f("lines", e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Length</label>
                      <input type="number" step="0.01" value={form.length} onChange={(e) => f("length", e.target.value)} className="input-field" />
                    </div>
                 </div>
              </div>

              <div className="col-span-2 border-b border-border pb-4 mb-2">
                <label className="flex items-center gap-2 text-sm text-foreground mb-3 cursor-pointer">
                   <input type="checkbox" checked={form.isReturn} onChange={(e) => f("isReturn", e.target.checked)} className="rounded border-border text-primary focus:ring-primary h-4 w-4" />
                   Customer Return / Rejection
                 </label>
                 
                 {form.isReturn && (
                   <div className="space-y-3 bg-destructive/5 p-3 rounded-lg border border-destructive/10 animate-fade-in pl-4">
                     <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-2">Return Details</p>
                     <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Returned Weight</label>
                          <input type="number" step="0.001" value={form.returnedWeight} onChange={(e) => f("returnedWeight", e.target.value)} placeholder="0.000" className="input-field" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Returned Pieces</label>
                          <input type="number" value={form.returnedPieces} onChange={(e) => f("returnedPieces", e.target.value)} className="input-field" />
                        </div>
                     </div>
                     <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Returned Lines</label>
                          <input type="number" value={form.returnedLines} onChange={(e) => f("returnedLines", e.target.value)} className="input-field" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Return Length</label>
                          <input type="number" step="0.01" value={form.returnedLength} onChange={(e) => f("returnedLength", e.target.value)} className="input-field" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Return Date</label>
                          <input type="date" value={form.returnDate} onChange={(e) => f("returnDate", e.target.value)} className="input-field" />
                        </div>
                     </div>
                   </div>
                 )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 md:col-span-1"><label className="block text-xs font-medium text-muted-foreground mb-1.5">Sale Price (₹) *</label>
                  <input required type="number" step="0.01" value={form.salePrice} onChange={(e) => f("salePrice", e.target.value)} placeholder="0.00" className="input-field" /></div>
                <div className="col-span-2 md:col-span-1"><label className="block text-xs font-medium text-muted-foreground mb-1.5">Discount (₹)</label>
                  <input type="number" step="0.01" value={form.discount} onChange={(e) => f("discount", e.target.value)} placeholder="0.00" className="input-field" /></div>
                <div className="col-span-2 md:col-span-1"><label className="block text-xs font-medium text-muted-foreground mb-1.5">Tax (₹)</label>
                  <input type="number" step="0.01" value={form.tax} onChange={(e) => f("tax", e.target.value)} placeholder="0.00" className="input-field" /></div>
                <div className="col-span-2 md:col-span-1"><label className="block text-xs font-medium text-muted-foreground mb-1.5">Bill No</label>
                  <input value={form.billNo} onChange={(e) => f("billNo", e.target.value)} placeholder="INV-001" className="input-field" /></div>
              </div>

              <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Net Sale:</span>
                  <span className="font-medium">{formatINR(netSale)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span>Final Bill Amount:</span>
                  <span className="text-emerald-400 text-lg">{formatINR(finalBill)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-border rounded-lg py-2.5 text-sm font-medium hover:bg-secondary transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 gem-gradient text-white rounded-lg py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Saving..." : "Record Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Wrench, Loader2, X, AlertCircle } from "lucide-react";
import { formatINR, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

const WEIGHT_UNITS = ["G", "KG", "CT"];

type Manufacturing = {
  id: string;
  subLot: { subLotNo: string; lot: { lotNo: string }; status: string };
  date: string;
  issuedTo: string;
  weight: number;
  weightUnit: string;
  pieces: number;
  labourCost: number;
  otherCost: number;
  totalManufacturingCost: number;
  status: string;
};

type SubLot = { id: string; subLotNo: string; lot: { lotNo: string }; weight: number; weightUnit: string };

export default function ManufacturingPage() {
  const [records, setRecords] = useState<Manufacturing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [subLots, setSubLots] = useState<SubLot[]>([]);

  const [form, setForm] = useState({
    subLotId: "", date: new Date().toISOString().slice(0, 10), issuedTo: "",
    weight: "", weightUnit: "G", pieces: "", shape: "", size: "", lines: "", length: "",
    selectionWeight: "", selectionPieces: "", selectionShape: "", selectionSize: "", selectionLines: "", selectionLength: "",
    rejectionWeight: "", rejectionPieces: "", rejectionLines: "", rejectionLength: "", returnToManufacturer: false, returnDate: "",
    labourCost: "", otherCost: "", entryType: "ISSUED",
  });

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/manufacturing?search=${search}`);
    const data = await r.json();
    setRecords(data.manufacturing || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  useEffect(() => {
    if (showForm) {
      fetch("/api/sublots?status=IN_STOCK")
        .then((r) => r.json())
        .then((d) => setSubLots(d.subLots || []));
    }
  }, [showForm]);

  const totalMfgCost = (parseFloat(form.labourCost || "0")) + (parseFloat(form.otherCost || "0"));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const r = await fetch("/api/manufacturing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        weight: parseFloat(form.weight),
        entryType: form.entryType,
        pieces: form.pieces ? parseInt(form.pieces) : undefined,
        lines: form.lines ? parseInt(form.lines) : undefined,
        length: form.length ? parseFloat(form.length) : undefined,
        
        selectionWeight: form.selectionWeight ? parseFloat(form.selectionWeight) : undefined,
        selectionPieces: form.selectionPieces ? parseInt(form.selectionPieces) : undefined,
        selectionShape: form.selectionShape || undefined,
        selectionSize: form.selectionSize || undefined,
        selectionLines: form.selectionLines ? parseInt(form.selectionLines) : undefined,
        selectionLength: form.selectionLength ? parseFloat(form.selectionLength) : undefined,
        
        rejectionWeight: form.rejectionWeight ? parseFloat(form.rejectionWeight) : undefined,
        rejectionPieces: form.rejectionPieces ? parseInt(form.rejectionPieces) : undefined,
        rejectionLines: form.rejectionLines ? parseInt(form.rejectionLines) : undefined,
        rejectionLength: form.rejectionLength ? parseFloat(form.rejectionLength) : undefined,
        returnDate: form.returnDate || null,
        returnToManufacturer: form.returnToManufacturer,
        
        labourCost: parseFloat(form.labourCost || "0"),
        otherCost: parseFloat(form.otherCost || "0"),
      }),
    });
    setSaving(false);
    if (r.ok) {
      setShowForm(false);
      fetchRecords();
    } else {
      const d = await r.json();
      setError(d.error || "Failed to save");
    }
  }

  const f = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary" /> Manufacturing
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{total} total records</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 gem-gradient text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lot, sub-lot, issued to..." className="input-field pl-9" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Lot No</th><th>Sub Lot</th><th>Date</th><th>Issued To</th>
                <th>Weight</th><th>Pieces</th><th>Labour Cost</th><th>Other Cost</th>
                <th>Total Mfg Cost</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-muted-foreground">No manufacturing records yet.</td></tr>
              ) : records.map((m) => (
                <tr key={m.id}>
                  <td><span className="font-mono text-primary font-medium">{m.subLot.lot.lotNo}</span></td>
                  <td><span className="font-mono text-sm">{m.subLot.subLotNo}</span></td>
                  <td>{formatDate(m.date)}</td>
                  <td>{m.issuedTo || "—"}</td>
                  <td>{m.weight} {m.weightUnit}</td>
                  <td>{m.pieces || "—"}</td>
                  <td>{formatINR(m.labourCost)}</td>
                  <td>{formatINR(m.otherCost)}</td>
                  <td className="font-semibold text-amber-400">{formatINR(m.totalManufacturingCost)}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(m.subLot.status)}`}>
                      {getStatusLabel(m.subLot.status)}
                    </span>
                  </td>
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
              <h2 className="text-lg font-semibold">New Manufacturing Entry</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  {error}
                </div>
              )}
              
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, entryType: "ISSUED" }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${form.entryType === "ISSUED" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
                >
                  Issue to Manufacturer
                </button>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, entryType: "RECEIVED" }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${form.entryType === "RECEIVED" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
                >
                  Receive from Manufacturer
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Select Sub Lot *</label>
                  <select required value={form.subLotId} onChange={(e) => f("subLotId", e.target.value)} className="input-field">
                    <option value="">— Select a Sub Lot —</option>
                    {subLots.map((sl) => (
                      <option key={sl.id} value={sl.id}>{sl.lot.lotNo} → {sl.subLotNo} ({sl.weight} {sl.weightUnit})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Date *</label>
                  <input required type="date" value={form.date} onChange={(e) => f("date", e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">{form.entryType === "ISSUED" ? "Issued To" : "Received From"}</label>
                  <input value={form.issuedTo} onChange={(e) => f("issuedTo", e.target.value)} placeholder="Manufacturer name" className="input-field" />
                </div>
                
                <div className="col-span-2 border-b border-border pb-3 mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3">{form.entryType === "ISSUED" ? "Issued" : "Received"} Details</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Weight Unit</label>
                      <select value={form.weightUnit} onChange={(e) => f("weightUnit", e.target.value)} className="input-field">
                        {WEIGHT_UNITS.map((u) => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Weight *</label>
                      <input required type="number" step="0.001" value={form.weight} onChange={(e) => f("weight", e.target.value)} placeholder="0.000" className="input-field" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Pieces</label>
                      <input type="number" value={form.pieces} onChange={(e) => f("pieces", e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Shape</label>
                      <input value={form.shape} onChange={(e) => f("shape", e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Size</label>
                      <input value={form.size} onChange={(e) => f("size", e.target.value)} className="input-field" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
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

                {form.entryType === "RECEIVED" && (
                  <>
                    <div className="col-span-2 border-t border-border pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-emerald-500">Selection</p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Weight</label>
                          <input type="number" step="0.001" value={form.selectionWeight} onChange={(e) => f("selectionWeight", e.target.value)} placeholder="0.000" className="input-field" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Pieces</label>
                          <input type="number" value={form.selectionPieces} onChange={(e) => f("selectionPieces", e.target.value)} className="input-field" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Shape</label>
                          <input value={form.selectionShape} onChange={(e) => f("selectionShape", e.target.value)} className="input-field" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Size</label>
                          <input value={form.selectionSize} onChange={(e) => f("selectionSize", e.target.value)} className="input-field" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">No. Lines</label>
                          <input type="number" value={form.selectionLines} onChange={(e) => f("selectionLines", e.target.value)} className="input-field" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Length</label>
                          <input type="number" step="0.01" value={form.selectionLength} onChange={(e) => f("selectionLength", e.target.value)} className="input-field" />
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 border-t border-border pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-destructive">Rejection</p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Weight</label>
                          <input type="number" step="0.001" value={form.rejectionWeight} onChange={(e) => f("rejectionWeight", e.target.value)} placeholder="0.000" className="input-field" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Pieces</label>
                          <input type="number" value={form.rejectionPieces} onChange={(e) => f("rejectionPieces", e.target.value)} className="input-field" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">No. Lines</label>
                          <input type="number" value={form.rejectionLines} onChange={(e) => f("rejectionLines", e.target.value)} className="input-field" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Length</label>
                          <input type="number" step="0.01" value={form.rejectionLength} onChange={(e) => f("rejectionLength", e.target.value)} className="input-field" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-2 border-t border-border pt-4">
                       <p className="text-xs font-semibold uppercase tracking-wider mb-3">Rejection Return</p>
                       <div className="grid grid-cols-2 gap-3">
                         <label className="flex items-center gap-2 text-sm text-foreground mt-6">
                           <input type="checkbox" checked={form.returnToManufacturer} onChange={(e) => setForm(p => ({...p, returnToManufacturer: e.target.checked}))} className="rounded border-border text-primary focus:ring-primary h-4 w-4" />
                           Return to Manufacturer?
                         </label>
                         <div>
                           <label className="block text-xs font-medium text-muted-foreground mb-1.5">Return Date</label>
                           <input type="date" value={form.returnDate} onChange={(e) => f("returnDate", e.target.value)} className="input-field" />
                         </div>
                       </div>
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Costing</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Labour Cost (₹)</label>
                    <input type="number" step="0.01" value={form.labourCost} onChange={(e) => f("labourCost", e.target.value)} placeholder="0.00" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Other Cost (₹)</label>
                    <input type="number" step="0.01" value={form.otherCost} onChange={(e) => f("otherCost", e.target.value)} placeholder="0.00" className="input-field" />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-secondary/50 rounded-lg flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Total Manufacturing Cost (Auto):</span>
                  <span className="font-semibold text-amber-400">{formatINR(totalMfgCost)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-border rounded-lg py-2.5 text-sm font-medium hover:bg-secondary transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 gem-gradient text-white rounded-lg py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

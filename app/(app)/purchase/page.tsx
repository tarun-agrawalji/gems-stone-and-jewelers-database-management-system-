"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, ShoppingCart, Loader2, X, ChevronDown, AlertCircle } from "lucide-react";
import { formatINR, formatDate, getCategoryLabel } from "@/lib/utils";

const WEIGHT_UNITS = ["G", "KG", "CT"];
const CATEGORIES = ["ROUGH", "READY_GOODS", "BY_ORDER"];

type Purchase = {
  id: string;
  lot: { lotNo: string; category: string };
  date: string;
  itemName: string;
  supplierName: string;
  grossWeight: number;
  netWeight: number;
  weightUnit: string;
  purchasePrice: number;
  totalCost: number;
  costPerGram: number;
  rejectionDate: string | null;
  rejectionStatus: string | null;
};

export default function PurchasePage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    lotNo: "", date: new Date().toISOString().slice(0, 10), itemName: "", category: "ROUGH",
    supplierName: "", descriptionRef: "", 
    grossWeight: "", lessWeight: "0", weightUnit: "G", size: "", shape: "", lines: "", lineLength: "", pieces: "",
    selectionWeight: "", selectionPieces: "", selectionLines: "", selectionLength: "",
    rejectionWeight: "", rejectionPieces: "", rejectionLines: "", rejectionLength: "", rejectionDate: "", rejectionStatus: "PENDING",
    purchasePrice: "",
  });

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/purchase?search=${search}`);
    const data = await r.json();
    setPurchases(data.purchases || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

  const netWeight = parseFloat(form.grossWeight || "0") - parseFloat(form.lessWeight || "0");
  const totalCostCalc = parseFloat(form.purchasePrice || "0");
  const netWeightG = form.weightUnit === "KG" ? netWeight * 1000 : form.weightUnit === "CT" ? netWeight * 0.2 : netWeight;
  const costPerGram = netWeightG > 0 ? totalCostCalc / netWeightG : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const r = await fetch("/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        grossWeight: parseFloat(form.grossWeight),
        lessWeight: parseFloat(form.lessWeight || "0"),
        lines: form.lines ? parseInt(form.lines) : undefined,
        lineLength: form.lineLength ? parseFloat(form.lineLength) : undefined,
        pieces: form.pieces ? parseInt(form.pieces) : undefined,
        
        selectionWeight: form.selectionWeight ? parseFloat(form.selectionWeight) : undefined,
        selectionPieces: form.selectionPieces ? parseInt(form.selectionPieces) : undefined,
        selectionLines: form.selectionLines ? parseInt(form.selectionLines) : undefined,
        selectionLength: form.selectionLength ? parseFloat(form.selectionLength) : undefined,
        
        rejectionWeight: form.rejectionWeight ? parseFloat(form.rejectionWeight) : undefined,
        rejectionPieces: form.rejectionPieces ? parseInt(form.rejectionPieces) : undefined,
        rejectionLines: form.rejectionLines ? parseInt(form.rejectionLines) : undefined,
        rejectionLength: form.rejectionLength ? parseFloat(form.rejectionLength) : undefined,
        rejectionDate: form.rejectionDate || null,
        rejectionStatus: form.rejectionStatus || "PENDING",
        
        purchasePrice: parseFloat(form.purchasePrice),
      }),
    });
    setSaving(false);
    if (r.ok) {
      setShowForm(false);
      setForm({
        lotNo: "", date: new Date().toISOString().slice(0, 10), itemName: "", category: "ROUGH",
        supplierName: "", descriptionRef: "", 
        grossWeight: "", lessWeight: "0", weightUnit: "G", size: "", shape: "", lines: "", lineLength: "", pieces: "",
        selectionWeight: "", selectionPieces: "", selectionLines: "", selectionLength: "",
        rejectionWeight: "", rejectionPieces: "", rejectionLines: "", rejectionLength: "", rejectionDate: "", rejectionStatus: "PENDING",
        purchasePrice: "",
      });
      fetchPurchases();
    } else {
      const d = await r.json();
      setError(d.error || "Failed to save purchase");
    }
  }

  const f = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" /> Purchase
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{total} total records</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 gem-gradient text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New Purchase
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search lot no, supplier, item..."
          className="input-field pl-9"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Lot No</th><th>Date</th><th>Item Name</th><th>Supplier</th>
                <th>Category</th><th>Gross Wt</th><th>Net Wt</th>
                <th>Purchase Price</th><th>Cost/g</th><th>Total Cost</th><th>Rejection</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                </td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-12 text-muted-foreground">
                  No purchases yet. Click "New Purchase" to add one.
                </td></tr>
              ) : purchases.map((p) => (
                <tr key={p.id}>
                  <td><span className="font-mono text-primary font-medium">{p.lot.lotNo}</span></td>
                  <td>{formatDate(p.date)}</td>
                  <td>{p.itemName || "—"}</td>
                  <td>{p.supplierName || "—"}</td>
                  <td><span className="text-xs bg-secondary px-2 py-0.5 rounded">{getCategoryLabel(p.lot.category)}</span></td>
                  <td>{p.grossWeight} {p.weightUnit}</td>
                  <td className="font-medium">{p.netWeight.toFixed(3)} {p.weightUnit}</td>
                  <td>{formatINR(p.purchasePrice)}</td>
                  <td>{formatINR(p.costPerGram || 0)}/g</td>
                  <td className="font-semibold text-amber-400">{formatINR(p.totalCost)}</td>
                  <td>
                    {p.rejectionDate
                      ? <span className="text-xs text-orange-400">{p.rejectionStatus || "Pending"}</span>
                      : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">New Purchase Entry</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Lot No *" required><input required value={form.lotNo} onChange={(e) => f("lotNo", e.target.value)} placeholder="e.g. LOT-101" className="input-field" /></Field>
                <Field label="Date *" required><input required type="date" value={form.date} onChange={(e) => f("date", e.target.value)} className="input-field" /></Field>
                <Field label="Item Name"><input value={form.itemName} onChange={(e) => f("itemName", e.target.value)} placeholder="e.g. Amethyst" className="input-field" /></Field>
                <Field label="Category">
                  <select value={form.category} onChange={(e) => f("category", e.target.value)} className="input-field">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
                  </select>
                </Field>
                <Field label="Supplier Name" className="col-span-2"><input value={form.supplierName} onChange={(e) => f("supplierName", e.target.value)} placeholder="Supplier name" className="input-field" /></Field>
                <Field label="Description / Reference" className="col-span-2"><input value={form.descriptionRef} onChange={(e) => f("descriptionRef", e.target.value)} placeholder="Reference notes" className="input-field" /></Field>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Received</p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <Field label="Weight Unit">
                    <select value={form.weightUnit} onChange={(e) => f("weightUnit", e.target.value)} className="input-field">
                      {WEIGHT_UNITS.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </Field>
                  <Field label="Gross Weight *" required><input required type="number" step="0.001" value={form.grossWeight} onChange={(e) => f("grossWeight", e.target.value)} placeholder="0.000" className="input-field" /></Field>
                  <Field label="Less Weight"><input type="number" step="0.001" value={form.lessWeight} onChange={(e) => f("lessWeight", e.target.value)} placeholder="0.000" className="input-field" /></Field>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <Field label="Size"><input value={form.size} onChange={(e) => f("size", e.target.value)} placeholder="10mm" className="input-field" /></Field>
                  <Field label="Shape"><input value={form.shape} onChange={(e) => f("shape", e.target.value)} placeholder="Round" className="input-field" /></Field>
                  <Field label="Total Pieces"><input type="number" value={form.pieces} onChange={(e) => f("pieces", e.target.value)} placeholder="0" className="input-field" /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Field label="No. of Lines"><input type="number" value={form.lines} onChange={(e) => f("lines", e.target.value)} placeholder="0" className="input-field" /></Field>
                  <Field label="Line Length"><input type="number" step="0.01" value={form.lineLength} onChange={(e) => f("lineLength", e.target.value)} placeholder="0.00" className="input-field" /></Field>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <span className="text-xs text-muted-foreground">Net Weight (Auto): </span>
                  <span className="font-semibold text-primary">{netWeight.toFixed(3)} {form.weightUnit}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-emerald-500">Selection</p>
                  <div className="space-y-3">
                    <Field label="Weight"><input type="number" step="0.001" value={form.selectionWeight} onChange={(e) => f("selectionWeight", e.target.value)} placeholder="0.000" className="input-field" /></Field>
                    <Field label="Pieces"><input type="number" value={form.selectionPieces} onChange={(e) => f("selectionPieces", e.target.value)} placeholder="0" className="input-field" /></Field>
                    <Field label="No. of Lines"><input type="number" value={form.selectionLines} onChange={(e) => f("selectionLines", e.target.value)} placeholder="0" className="input-field" /></Field>
                    <Field label="Line Length"><input type="number" step="0.01" value={form.selectionLength} onChange={(e) => f("selectionLength", e.target.value)} placeholder="0.00" className="input-field" /></Field>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-destructive">Rejection</p>
                  <div className="space-y-3">
                    <Field label="Weight"><input type="number" step="0.001" value={form.rejectionWeight} onChange={(e) => f("rejectionWeight", e.target.value)} placeholder="0.000" className="input-field" /></Field>
                    <Field label="Pieces"><input type="number" value={form.rejectionPieces} onChange={(e) => f("rejectionPieces", e.target.value)} placeholder="0" className="input-field" /></Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="No. Lines"><input type="number" value={form.rejectionLines} onChange={(e) => f("rejectionLines", e.target.value)} placeholder="0" className="input-field" /></Field>
                      <Field label="Line Length"><input type="number" step="0.01" value={form.rejectionLength} onChange={(e) => f("rejectionLength", e.target.value)} placeholder="0.00" className="input-field" /></Field>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Rejection Return Details</p>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <Field label="Date of Return">
                    <input type="date" value={form.rejectionDate} onChange={(e) => f("rejectionDate", e.target.value)} className="input-field" />
                  </Field>
                  <Field label="Rejection Status">
                    <select value={form.rejectionStatus} onChange={(e) => f("rejectionStatus", e.target.value)} className="input-field">
                      <option value="PENDING">PENDING</option>
                      <option value="RETURNED">RETURNED</option>
                      <option value="RESELLABLE">RESELLABLE</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </Field>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pricing</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Field label="Purchase Price (₹) *" required><input required type="number" step="0.01" value={form.purchasePrice} onChange={(e) => f("purchasePrice", e.target.value)} placeholder="0.00" className="input-field" /></Field>
                  <div className="flex flex-col justify-end">
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Cost per gram: <span className="text-primary font-medium">{formatINR(costPerGram)}</span></p>
                      <p className="text-xs text-muted-foreground mt-1">Total cost: <span className="text-amber-400 font-semibold">{formatINR(totalCostCalc)}</span></p>
                    </div>
                  </div>
                </div>
              </div>



              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-border rounded-lg py-2.5 text-sm font-medium hover:bg-secondary transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 gem-gradient text-white rounded-lg py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Purchase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, className = "", required }: { label: string; children: React.ReactNode; className?: string; required?: boolean }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

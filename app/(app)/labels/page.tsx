"use client";

import { useState, useEffect } from "react";
import { Tag, Search, Loader2, Printer } from "lucide-react";
import { formatDate } from "@/lib/utils";

type SubLot = {
  id: string;
  subLotNo: string;
  lot: { lotNo: string; itemName: string | null };
  weight: number;
  weightUnit: string;
  pieces: number | null;
  shape: string | null;
  size: string | null;
  lines: number | null;
  length: number | null;
  status: string;
};

export default function LabelsPage() {
  const [subLots, setSubLots] = useState<SubLot[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SubLot | null>(null);
  const [shopName, setShopName] = useState("");
  const [labelType, setLabelType] = useState<"STOCK" | "RECEIVED">("STOCK");
  const [selectionMark, setSelectionMark] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch(`/api/sublots?search=${search}`)
      .then((r) => r.json())
      .then((d) => { setSubLots(d.subLots || []); setLoading(false); });
  }, [search]);

  async function generatePDF() {
    if (!selected) return;
    setGenerating(true);

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [100, 70] });

    const pageW = 100;
    const pageH = 70;
    const padding = 6;

    // Header Bar
    doc.setFillColor(36, 67, 235);
    doc.rect(0, 0, pageW, 18, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    if (shopName) {
      doc.text(shopName.toUpperCase(), pageW / 2, 8, { align: "center" });
    }
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(labelType === "STOCK" ? "STOCK LABEL" : "RECEIVED LABEL", pageW / 2, 14, { align: "center" });

    // Content
    doc.setTextColor(20, 20, 20);
    let y = 23;
    const col1 = padding;
    const col2 = pageW / 2 + 2;
    const lineH = 7;

    function row(label: string, value: string, col: number = col1) {
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 100, 120);
      doc.text(label, col, y);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(20, 20, 40);
      doc.text(value || "—", col, y + 4);
    }

    row("LOT NO", selected.lot.lotNo, col1);
    row("SUB LOT", selected.subLotNo, col2);
    y += lineH;
    if (selected.lot.itemName) {
      row("ITEM", selected.lot.itemName, col1);
      y += lineH;
    }
    row("WEIGHT", `${selected.weight} ${selected.weightUnit}`, col1);
    row("PIECES", String(selected.pieces || "—"), col2);
    y += lineH;
    row("SHAPE", selected.shape || "—", col1);
    row("SIZE", selected.size || "—", col2);
    y += lineH;
    if (selected.lines) {
      row("LINES", String(selected.lines), col1);
      row("LENGTH", selected.length ? `${selected.length}` : "—", col2);
      y += lineH;
    }

    if (labelType === "RECEIVED" && selectionMark) {
      doc.setFillColor(selectionMark === "SELECTION" ? 34 : 239, selectionMark === "SELECTION" ? 197 : 68, selectionMark === "SELECTION" ? 94 : 68);
      doc.roundedRect(padding, y - 2, 40, 8, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(selectionMark, padding + 20, y + 3.5, { align: "center" });
    }

    // Footer
    doc.setFillColor(240, 242, 255);
    doc.rect(0, pageH - 8, pageW, 8, "F");
    doc.setTextColor(100, 100, 120);
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${formatDate(new Date())}`, pageW / 2, pageH - 3, { align: "center" });

    doc.save(`label-${selected.lot.lotNo}-${selected.subLotNo}.pdf`);
    setGenerating(false);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <Tag className="w-6 h-6 text-primary" /> Label System
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Generate printable stock and received labels</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Sub Lot Selector */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-semibold text-sm">1. Select Sub Lot</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by lot or sub-lot..." className="input-field pl-9" />
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></div>
            ) : subLots.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No sub-lots found</p>
            ) : subLots.map((sl) => (
              <button
                key={sl.id}
                onClick={() => setSelected(sl)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all border ${
                  selected?.id === sl.id
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "border-transparent hover:bg-secondary/60"
                }`}
              >
                <span className="font-mono font-medium">{sl.lot.lotNo}</span>
                <span className="text-muted-foreground"> → {sl.subLotNo}</span>
                <span className="ml-2 text-xs text-muted-foreground">({sl.weight} {sl.weightUnit})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Label Config & Preview */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-semibold text-sm">2. Configure & Preview</h3>
          {!selected ? (
            <div className="flex items-center justify-center h-52 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
              Select a sub-lot from the left
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Label Type</label>
                  <select value={labelType} onChange={(e) => setLabelType(e.target.value as "STOCK" | "RECEIVED")} className="input-field">
                    <option value="STOCK">Stock Label</option>
                    <option value="RECEIVED">Received Label</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Shop Name</label>
                  <input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Your shop name" className="input-field" />
                </div>
              </div>

              {labelType === "RECEIVED" && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Mark (Optional)</label>
                  <select value={selectionMark} onChange={(e) => setSelectionMark(e.target.value)} className="input-field">
                    <option value="">None</option>
                    <option value="SELECTION">✓ Selection</option>
                    <option value="REJECTION">✗ Rejection</option>
                  </select>
                </div>
              )}

              {/* Preview Card */}
              <div className="border-2 border-dashed border-primary/30 rounded-xl p-4 bg-white text-slate-900 font-sans">
                <div className="bg-blue-600 text-white text-center py-2 rounded-lg mb-3">
                  <p className="text-sm font-bold">{shopName || "[ SHOP NAME ]"}</p>
                  <p className="text-xs opacity-80">{labelType === "STOCK" ? "STOCK LABEL" : "RECEIVED LABEL"}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div><p className="text-gray-400 text-[10px]">LOT NO</p><p className="font-bold">{selected.lot.lotNo}</p></div>
                  <div><p className="text-gray-400 text-[10px]">SUB LOT</p><p className="font-bold">{selected.subLotNo}</p></div>
                  {selected.lot.itemName && <div className="col-span-2"><p className="text-gray-400 text-[10px]">ITEM</p><p className="font-medium">{selected.lot.itemName}</p></div>}
                  <div><p className="text-gray-400 text-[10px]">WEIGHT</p><p className="font-medium">{selected.weight} {selected.weightUnit}</p></div>
                  <div><p className="text-gray-400 text-[10px]">PIECES</p><p className="font-medium">{selected.pieces || "—"}</p></div>
                  <div><p className="text-gray-400 text-[10px]">SHAPE</p><p className="font-medium">{selected.shape || "—"}</p></div>
                  <div><p className="text-gray-400 text-[10px]">SIZE</p><p className="font-medium">{selected.size || "—"}</p></div>
                  {selected.lines && <><div><p className="text-gray-400 text-[10px]">LINES</p><p className="font-medium">{selected.lines}</p></div>
                  <div><p className="text-gray-400 text-[10px]">LENGTH</p><p className="font-medium">{selected.length || "—"}</p></div></>}
                </div>
                {labelType === "RECEIVED" && selectionMark && (
                  <div className={`mt-2 text-center text-white text-xs font-bold py-1 rounded ${selectionMark === "SELECTION" ? "bg-emerald-500" : "bg-red-500"}`}>
                    {selectionMark}
                  </div>
                )}
              </div>

              <button
                onClick={generatePDF}
                disabled={generating}
                className="w-full gem-gradient text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                {generating ? "Generating PDF..." : "Download PDF Label"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

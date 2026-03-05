"use client";

import { useState, useEffect } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { formatINR, getStatusLabel } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const statusChartData = (stats?.subLotsByStatus || []).map((s: any) => ({
    name: getStatusLabel(s.status),
    Count: s._count,
  }));

  const summaryData = [
    { name: "Total Purchase Value", value: stats?.totalPurchaseValue || 0 },
    { name: "Total Sales Value", value: stats?.totalSaleValue || 0 },
    { name: "Net Profit", value: (stats?.totalSaleValue || 0) - (stats?.totalPurchaseValue || 0) },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Reports
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Financial and inventory analytics</p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-4">
        {summaryData.map((item) => (
          <div key={item.name} className="glass-card p-5">
            <p className="text-xs text-muted-foreground mb-1">{item.name}</p>
            <p className={`text-2xl font-bold ${item.value >= 0 ? "text-foreground" : "text-red-400"}`}>
              {formatINR(item.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4 text-sm">Stock Status Distribution</h3>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statusChartData} margin={{ top: 0, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                <Bar dataKey="Count" fill="#3b63f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-16">No data yet</p>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4 text-sm">Summary</h3>
          <div className="space-y-3">
            {[
              { label: "Total Lots", value: stats?.totalLots || 0, unit: "lots" },
              { label: "Total Sub-Lots", value: stats?.totalSubLots || 0, unit: "sub-lots" },
              { label: "Total Purchases", value: stats?.totalPurchases || 0, unit: "records" },
              { label: "Total Sales", value: stats?.totalSales || 0, unit: "records" },
              { label: "Rejection Pending", value: stats?.pendingRejections || 0, unit: "items", highlight: true },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className={`text-sm font-semibold ${row.highlight ? "text-orange-400" : "text-foreground"}`}>
                  {row.value} <span className="text-xs font-normal text-muted-foreground">{row.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

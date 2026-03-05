"use client";

import { useEffect, useState } from "react";
import {
  Gem, Package, ShoppingCart, TrendingUp, AlertTriangle,
  BookOpen, Loader2, ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
import { formatINR, getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  IN_STOCK: "#10b981",
  IN_PROCESS: "#f59e0b",
  READY: "#3b82f6",
  PARTIALLY_SOLD: "#8b5cf6",
  CLOSED: "#6b7280",
  RETURNED: "#06b6d4",
  PENDING: "#f97316",
  CLOSED_RETURNED: "#ef4444",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusData = (stats?.subLotsByStatus || []).map((s: any) => ({
    name: getStatusLabel(s.status),
    value: s._count,
    color: STATUS_COLORS[s.status] || "#6b7280",
  }));

  const profit = (stats?.totalSaleValue || 0) - (stats?.totalPurchaseValue || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-header">Inventory Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Live overview of your gem inventory</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Lots"
          value={stats?.totalLots || 0}
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Total Sub-Lots"
          value={stats?.totalSubLots || 0}
          icon={<Gem className="w-5 h-5" />}
          color="violet"
        />
        <StatCard
          title="Purchase Value"
          value={formatINR(stats?.totalPurchaseValue || 0)}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="amber"
          isString
        />
        <StatCard
          title="Sales Value"
          value={formatINR(stats?.totalSaleValue || 0)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="emerald"
          isString
        />
      </div>

      {/* Profit + Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground mb-1">Net Profit / Loss</p>
          <p className={`text-3xl font-bold ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {formatINR(profit)}
          </p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {profit >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{profit >= 0 ? "Positive" : "Negative"} margin</span>
          </div>
        </div>

        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground mb-1">Rejection Pending</p>
          <p className="text-3xl font-bold text-orange-400">{stats?.pendingRejections || 0}</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-orange-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Requires attention</span>
          </div>
        </div>

        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
          <p className="text-3xl font-bold">{(stats?.totalPurchases || 0) + (stats?.totalSales || 0)}</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span>{stats?.totalPurchases} purchases · {stats?.totalSales} sales</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">Stock by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                  labelStyle={{ color: "#f8fafc" }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-muted-foreground text-sm">
              No data yet. Add purchases to see stats.
            </div>
          )}
        </div>

        {/* Recent Ledger */}
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Recent Ledger Activity
          </h3>
          <div className="space-y-2.5">
            {(stats?.recentLedger || []).length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No activity yet</p>
            ) : (
              (stats?.recentLedger || []).slice(0, 6).map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{entry.lot?.lotNo || "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.fromLocation} → {entry.toLocation}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{entry.weight} {entry.weightUnit}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, isString = false }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "violet" | "amber" | "emerald";
  isString?: boolean;
}) {
  const colorMap = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className={`${isString ? "text-xl" : "text-3xl"} font-bold`}>{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

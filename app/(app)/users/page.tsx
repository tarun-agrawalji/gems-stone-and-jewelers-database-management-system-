"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Loader2, X, AlertCircle, Shield, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STAFF" });

  const fetchUsers = async () => {
    setLoading(true);
    const r = await fetch("/api/users");
    const data = await r.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const r = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (r.ok) {
      setShowForm(false);
      setForm({ name: "", email: "", password: "", role: "STAFF" });
      fetchUsers();
    } else {
      const d = await r.json();
      setError(d.error || "Failed to create user");
    }
  }

  const f = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> User Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Admin only — manage system users and roles</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 gem-gradient text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{u.email}</td>
                  <td>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.role === "ADMIN"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                        : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                    }`}>
                      {u.role === "ADMIN" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      u.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                    }`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-muted-foreground text-xs">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">Add New User</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"><AlertCircle className="w-4 h-4 mt-0.5" />{error}</div>}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name *</label>
                <input required value={form.name} onChange={(e) => f("name", e.target.value)} placeholder="John Doe" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => f("email", e.target.value)} placeholder="john@example.com" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password *</label>
                <input required type="password" minLength={6} value={form.password} onChange={(e) => f("password", e.target.value)} placeholder="Min 6 characters" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Role *</label>
                <select value={form.role} onChange={(e) => f("role", e.target.value)} className="input-field">
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-border rounded-lg py-2.5 text-sm font-medium hover:bg-secondary transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 gem-gradient text-white rounded-lg py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

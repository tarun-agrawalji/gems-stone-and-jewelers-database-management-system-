"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Gem,
  LayoutDashboard,
  ShoppingCart,
  Wrench,
  TrendingUp,
  BookOpen,
  History,
  Tag,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Package,
  BarChart3,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/purchase", label: "Purchase", icon: ShoppingCart },
  { href: "/manufacturing", label: "Manufacturing", icon: Wrench },
  { href: "/sales", label: "Sales", icon: TrendingUp },
  { href: "/ledger", label: "Stock Ledger", icon: BookOpen },
  { href: "/product-history", label: "Product History", icon: History },
  { href: "/labels", label: "Labels", icon: Tag },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

const adminItems = [
  { href: "/users", label: "User Management", icon: Users },
];

interface SidebarProps {
  userRole?: string;
  userName?: string;
  userEmail?: string;
}

export default function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-card/80 backdrop-blur-xl border-r border-border transition-all duration-300 ease-in-out flex-shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 p-4 border-b border-border",
        collapsed && "justify-center"
      )}>
        <div className="w-9 h-9 rounded-xl gem-gradient flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
          <Gem className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-tight truncate">Gem Inventory</p>
            <p className="text-xs text-muted-foreground truncate">Management System</p>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3" />
          : <ChevronLeft className="w-3 h-3" />
        }
      </button>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider px-3 py-2 mb-1">
            Navigation
          </p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "sidebar-link",
                isActive && "active",
                collapsed && "justify-center px-0"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {userRole === "ADMIN" && (
          <>
            {!collapsed && (
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider px-3 py-2 mt-4 mb-1">
                Admin
              </p>
            )}
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "sidebar-link",
                    isActive && "active",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <Icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-primary")} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User Footer */}
      <div className={cn("p-3 border-t border-border", collapsed && "flex justify-center")}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-secondary/50">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary">
                {userName?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userRole}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Sign out"
          className={cn(
            "sidebar-link w-full text-destructive hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

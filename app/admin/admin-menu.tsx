"use client";

import { useState } from "react";
import { Menu, X, BarChart2, User, ClipboardList, Tags, Package, LayoutGrid } from "lucide-react";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid, href: "/admin" },
  { id: "analytics", label: "Analytics", icon: BarChart2, href: "/admin/analytics" },
  { id: "orders", label: "Orders", icon: ClipboardList, href: "/admin/orders" },
  { id: "categories", label: "Categories", icon: Tags, href: "/admin/categories" },
  { id: "inventory", label: "Inventory", icon: Package, href: "/admin/inventory" },
  { id: "account", label: "Account", icon: User, href: "/admin/account" },
];

export default function AdminMenu() {
  const [open, setOpen] = useState(false);

  const handleNavigate = (href: string) => {
    window.location.href = href;
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg bg-(--card-bg-secondary) border border-(--border-color) hover:border-brand/40 hover:bg-brand/10 transition-all text-foreground/75 hover:text-brand"
        aria-label="Toggle admin menu"
      >
        {open ? <X size={16} /> : <Menu size={16} />}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-52 rounded-2xl border border-(--border-color) bg-(--card-bg) shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
          <div className="px-4 py-3 text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/45">
            Command Menu
          </div>
          <div className="border-t border-(--border-color)">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.href)}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.3em] text-foreground/80 hover:text-foreground hover:bg-brand/8 transition-colors"
                >
                  <Icon size={12} className="text-brand" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

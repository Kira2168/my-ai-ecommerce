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
        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-brand/40 hover:bg-brand/10 transition-all text-white/70 hover:text-brand"
        aria-label="Toggle admin menu"
      >
        {open ? <X size={16} /> : <Menu size={16} />}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 text-[9px] font-mono uppercase tracking-[0.3em] text-white/30">
            Command Menu
          </div>
          <div className="border-t border-white/5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.href)}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.3em] text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
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

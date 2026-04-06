"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SHOP_THEME_KEY = "futureshop-theme-shop";
const ADMIN_THEME_KEY = "futureshop-theme-admin";

function applyTheme(theme: "dark" | "light") {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
}

export default function ThemeScopeSync() {
  const pathname = usePathname();

  useEffect(() => {
    const key = pathname.startsWith("/admin") ? ADMIN_THEME_KEY : SHOP_THEME_KEY;
    const saved = localStorage.getItem(key);
    const theme = saved === "light" ? "light" : "dark";
    applyTheme(theme);
  }, [pathname]);

  return null;
}

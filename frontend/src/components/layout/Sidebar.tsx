"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Tag,
  Settings,
  ShoppingBag,
  Database,
  Bot,
  Briefcase,
  Shield,
  Sparkles,
  Heart,
  BellRing,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const role = user?.role || "CONSUMER";

  const activeRoutes = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ...(role === "ADMIN"
      ? [{ href: "/admin", label: "Admin Console", icon: Shield }]
      : []),
    ...(role === "ADMIN"
      ? [{ href: "/scraper", label: "Scraper Engine", icon: Database }]
      : []),
    ...(role === "BUSINESS" || role === "ADMIN"
      ? [{ href: "/business", label: "B2B Analytics", icon: Briefcase }]
      : []),
    ...(role === "BUSINESS" || role === "ADMIN"
      ? [{ href: "/analytics", label: "Market Analytics", icon: BarChart3 }]
      : []),
    { href: "/products", label: "Products", icon: ShoppingBag },
    { href: "/assistant", label: "AI Assistant", icon: Bot },
    { href: "/baskets", label: "Baskets", icon: ShoppingCart },
    { href: "/discounts", label: "Discounts", icon: Tag },
    { href: "/favorites", label: "Wishlist", icon: Heart },
    { href: "/alerts", label: "Price Alerts", icon: BellRing },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex w-[260px] flex-col bg-background/80 backdrop-blur-xl border-r border-border shadow-[4px_0_24px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.3)] z-20 select-none"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-border/80">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 4 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary via-emerald-500 to-lime-400 text-primary-foreground shadow-md shadow-primary/20"
          >
            <span className="font-extrabold text-lg text-white">G</span>
          </motion.div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              Grocera
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold -mt-1 tracking-widest uppercase">
              Retail Intelligence
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 mt-2">
        {activeRoutes.map((route) => {
          const isActive = pathname === route.href;
          const Icon = route.icon;

          return (
            <Link
              key={route.href}
              href={route.href}
              className="block relative group"
            >
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                className={`relative z-10 flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarTab"
                    className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-600 rounded-lg shadow-md shadow-primary/25 z-[-1]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive
                      ? "text-white"
                      : "group-hover:scale-110 group-hover:text-primary"
                  }`}
                />
                <span
                  className={`text-sm tracking-wide ${isActive ? "text-white" : ""}`}
                >
                  {route.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Promotional / Status Card */}
      <div className="p-4 mt-auto mb-3">
        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className="relative p-5 rounded-2xl overflow-hidden shadow-xl border border-white/20 group"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-emerald-800 to-black bg-cover bg-center transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-lime-400/20 rounded-full blur-2xl animate-glow-pulse" />

          <div className="relative z-10 flex flex-col items-start">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-lime-300 flex items-center gap-1">
                <Sparkles
                  className="w-3 h-3 animate-spin"
                  style={{ animationDuration: "8s" }}
                />{" "}
                Pro Account
              </span>
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
            </div>
            <h4 className="text-sm font-extrabold text-white tracking-wide">
              Grocera Engine v2
            </h4>
            <p className="text-xs text-white/80 mt-1 mb-3">
              Real-time Sri Lanka price sync active.
            </p>
            <button className="w-full py-2 text-xs font-bold bg-white text-emerald-950 rounded-lg hover:bg-lime-300 hover:text-black hover:shadow-lg active:scale-[0.98] transition-all duration-200 shadow-md flex items-center justify-center gap-1">
              Manage Plan
            </button>
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
}

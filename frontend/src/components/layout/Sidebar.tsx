"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Tag, Settings, ShoppingBag, Database, Bot, Briefcase, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { useAuthStore } from "@/store/useAuthStore"

const routes = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assistant", label: "AI Assistant", icon: Bot },
  { href: "/products", label: "Products", icon: ShoppingBag },
  { href: "/baskets", label: "Baskets", icon: ShoppingCart },
  { href: "/discounts", label: "Discounts", icon: Tag },
  { href: "/scraper", label: "Scraper Engine", icon: Database },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()

  const activeRoutes = [...routes]
  if (user?.role === 'BUSINESS') {
    activeRoutes.splice(1, 0, { href: "/business", label: "B2B Analytics", icon: Briefcase })
  }
  
  if (user?.role === 'ADMIN') {
    activeRoutes.push({ href: "/admin", label: "Admin Panel", icon: Shield })
  }

  return (
    <motion.aside 
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="hidden md:flex w-[260px] flex-col bg-background/80 backdrop-blur-xl border-r border-border shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)] z-10"
    >
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="font-bold text-lg">G</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Grocera</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 mt-2">
        {activeRoutes.map((route) => {
          const isActive = pathname === route.href
          const Icon = route.icon
          
          return (
            <Link key={route.href} href={route.href} className="block group">
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ease-out ${
                  isActive 
                    ? "bg-primary text-primary-foreground font-semibold shadow-md" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${!isActive && 'group-hover:scale-110 group-hover:text-primary'}`} />
                <span className={`text-sm transition-transform duration-200 ${!isActive && 'group-hover:translate-x-1'}`}>{route.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 mt-auto mb-4">
        <div className="relative p-5 rounded-xl overflow-hidden shadow-lg border border-white/10 group">
          {/* Background Image Layer */}
          <div className="absolute inset-0 bg-[url('/images/pro_card_bg.png')] bg-cover bg-center transition-transform duration-500 group-hover:scale-110"></div>
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>
          
          <div className="relative z-10 flex flex-col items-start">
            <h4 className="text-sm font-bold text-white tracking-wide">Grocera Pro</h4>
            <p className="text-xs text-white/80 mt-1 mb-3">Your subscription is active.</p>
            <button className="w-full py-2 text-xs font-bold bg-white text-black rounded-md hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md">
              Manage Plan
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}

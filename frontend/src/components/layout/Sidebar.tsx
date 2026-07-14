"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Tag, Settings, ShoppingBag, Database, Bot } from "lucide-react"

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

  return (
    <aside className="hidden md:flex w-[260px] flex-col bg-background border-r border-border">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="font-bold text-lg">G</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Grocera</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 mt-2">
        {routes.map((route) => {
          const isActive = pathname === route.href
          const Icon = route.icon
          
          return (
            <Link key={route.href} href={route.href} className="block">
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground font-semibold" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted font-medium"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{route.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 mt-auto mb-4 border-t border-border">
        <div className="p-4 rounded-lg bg-secondary border border-border">
          <h4 className="text-sm font-bold text-foreground">Grocera Pro</h4>
          <p className="text-xs text-muted-foreground mt-1 mb-3">Your subscription is active.</p>
          <button className="w-full py-2 text-xs font-bold bg-primary text-primary-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
            Manage Plan
          </button>
        </div>
      </div>
    </aside>
  )
}

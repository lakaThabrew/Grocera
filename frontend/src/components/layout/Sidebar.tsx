import Link from "next/link"
import { Home, LineChart, ShoppingBag, Settings, Tag } from "lucide-react"

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r bg-muted/40 md:flex">
      <div className="flex flex-col gap-2 p-4">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <Link href="/products" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
          <ShoppingBag className="h-4 w-4" />
          Products
        </Link>
        <Link href="/discounts" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
          <Tag className="h-4 w-4" />
          Discounts
        </Link>
        <Link href="/analytics" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
          <LineChart className="h-4 w-4" />
          Analytics
        </Link>
        <div className="mt-auto pt-4">
          <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  )
}

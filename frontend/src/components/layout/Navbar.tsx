"use client"

import { useAuthStore } from "@/store/useAuthStore"
import { Bell, Search, User, LogOut } from "lucide-react"

export function Navbar() {
  const { user, logout } = useAuthStore()

  return (
    <header className="sticky top-0 z-50 w-full h-16 flex items-center justify-between px-6 bg-background border-b border-border shadow-sm">
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full max-w-sm hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-card border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
        </button>
        <div className="flex items-center gap-4 pl-4 border-l border-border">
          {user ? (
            <>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-foreground">{user.email}</div>
                <div className="text-xs text-primary font-medium">{user.role}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <User className="h-5 w-5" />
              </div>
              <button onClick={logout} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all" title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <a href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors px-3 py-2">
                Log in
              </a>
              <a href="/register" className="text-sm font-medium bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors px-4 py-2 rounded-md">
                Sign up
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

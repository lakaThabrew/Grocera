"use client"

import { useState, useEffect, useRef } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { Bell, Search, User, LogOut, Check, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/api"
import Link from "next/link"

interface Notification {
  id: string
  title: string
  message: string
  isRead: boolean
  type: string
  link?: string
  createdAt: string
}

export function Navbar() {
  const { user, logout } = useAuthStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/consumers/notifications')
      setNotifications(res.data)
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    }
  }

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await api.patch(`/consumers/notifications/${id}/read`)
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (error) {
      console.error('Failed to mark read', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <header className="sticky top-0 z-40 w-full h-16 flex items-center justify-between px-6 bg-background/70 backdrop-blur-md border-b border-border shadow-sm">
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full max-w-sm hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-card/80 backdrop-blur-sm border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:w-[120%] transition-all duration-300 ease-out shadow-sm"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        
        {/* Notifications Dropdown */}
        {user && (
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-muted transition-colors group"
            >
              <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:scale-110 group-hover:rotate-12 transition-all duration-200" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full border-2 border-background text-[9px] font-bold text-destructive-foreground flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 glass-card rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                >
                  <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                    <h3 className="font-semibold">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-sm text-muted-foreground">No notifications yet.</p>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-4 border-b border-border/50 hover:bg-muted/20 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}
                        >
                          <div className="flex justify-between gap-2">
                            <div>
                              <h4 className={`text-sm font-medium ${!notif.isRead ? 'text-primary' : 'text-foreground'}`}>
                                {notif.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {notif.message}
                              </p>
                            </div>
                            {!notif.isRead && (
                              <button 
                                onClick={(e) => markAsRead(notif.id, e)}
                                className="h-6 w-6 shrink-0 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center"
                                title="Mark as read"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          {notif.link && (
                            <Link href={notif.link} className="text-xs text-primary font-medium hover:underline mt-2 inline-block">
                              View Details &rarr;
                            </Link>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

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

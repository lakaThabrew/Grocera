"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Bell, Search, User, LogOut, Check, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  link?: string;
  createdAt: string;
}

export function Navbar() {
  const { user, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/consumers/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.patch(`/consumers/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 w-full h-16 flex items-center justify-between px-6 bg-background/70 backdrop-blur-xl border-b border-border/80 shadow-sm transition-all">
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full max-w-sm hidden md:block">
          <Search
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
              isSearchFocused ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <input
            type="text"
            placeholder="Search products, stores, discounts..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full bg-card/80 backdrop-blur-sm border border-input/80 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300 shadow-sm hover:border-primary/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        {user && (
          <div className="relative" ref={notifRef}>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl hover:bg-muted/80 transition-all group border border-transparent hover:border-border"
            >
              <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-full border-2 border-background text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 mt-3 w-84 glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col z-50"
                >
                  <div className="p-4 border-b border-border bg-muted/40 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground text-sm">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/20 text-primary">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                        <Bell className="h-8 w-8 mb-2 opacity-30" />
                        <p className="text-sm font-medium">All caught up!</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          No unread notifications right now.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 hover:bg-muted/30 transition-colors ${!notif.isRead ? "bg-primary/5" : ""}`}
                        >
                          <div className="flex justify-between gap-2">
                            <div>
                              <h4
                                className={`text-sm font-semibold ${!notif.isRead ? "text-primary" : "text-foreground"}`}
                              >
                                {notif.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {notif.message}
                              </p>
                            </div>
                            {!notif.isRead && (
                              <button
                                onClick={(e) => markAsRead(notif.id, e)}
                                className="h-6 w-6 shrink-0 rounded-full bg-primary/10 hover:bg-primary/30 text-primary flex items-center justify-center transition-colors"
                                title="Mark as read"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          {notif.link && (
                            <Link
                              href={notif.link}
                              className="text-xs text-primary font-semibold hover:underline mt-2 inline-flex items-center gap-1"
                            >
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

        <div className="flex items-center gap-4 pl-4 border-l border-border/80">
          {user ? (
            <>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-foreground">
                  {user.email}
                </div>
                <div className="text-xs font-bold text-primary flex items-center justify-end gap-1">
                  <Sparkles className="w-3 h-3" /> {user.role}
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary via-emerald-500 to-lime-400 p-[2px] shadow-md shadow-primary/20 cursor-pointer"
              >
                <div className="h-full w-full bg-background rounded-full flex items-center justify-center text-primary">
                  <User className="h-5 w-5" />
                </div>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut className="h-4.5 w-4.5" />
              </motion.button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <a
                href="/login"
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors px-4 py-2 rounded-lg"
              >
                Log in
              </a>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="/register"
                className="text-sm font-semibold bg-gradient-to-r from-primary to-emerald-600 text-white shadow-md shadow-primary/20 hover:shadow-lg transition-all px-4 py-2 rounded-xl"
              >
                Sign up
              </motion.a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

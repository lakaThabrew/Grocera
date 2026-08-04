"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Key,
  Save,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuthStore();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <PageWrapper className="max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Account & Preferences
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal profile, notification channels, and security
            settings.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm font-semibold flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" /> Preferences saved successfully!
          </motion.div>
        )}

        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-6 border-border/80 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Profile Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full rounded-xl border border-input/60 bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Current Account Role
              </label>
              <div className="w-full rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> {user?.role || "CONSUMER"}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="glass-card rounded-2xl p-6 border-border/80 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Price Alert Notifications
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/60">
              <div>
                <p className="text-sm font-bold text-foreground">
                  Email Notifications
                </p>
                <p className="text-xs text-muted-foreground">
                  Receive instant emails when prices drop on wishlisted items.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="h-5 w-5 rounded border-input text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/60">
              <div>
                <p className="text-sm font-bold text-foreground">SMS Alerts</p>
                <p className="text-xs text-muted-foreground">
                  Get high-priority SMS alerts for urgent deal drops.
                </p>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="h-5 w-5 rounded border-input text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/60">
              <div>
                <p className="text-sm font-bold text-foreground">
                  Browser Push Notifications
                </p>
                <p className="text-xs text-muted-foreground">
                  Allow push notifications while browsing Grocera.
                </p>
              </div>
              <input
                type="checkbox"
                checked={pushAlerts}
                onChange={(e) => setPushAlerts(e.target.checked)}
                className="h-5 w-5 rounded border-input text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="glass-card rounded-2xl p-6 border-border/80 shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" /> Security
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Preferences
          </motion.button>
        </div>
      </form>
    </PageWrapper>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const useDemoCredentials = () => {
    setEmail("demo.consumer@grocera.test");
    setPassword("Demo12345!");
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.user, res.data.access_token);
      router.push("/");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full flex items-center justify-center min-h-[80vh]">
      {/* Floating ambient glow blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-glow-pulse pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-lime-400/15 rounded-full blur-2xl animate-float-slow pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md rounded-3xl glass-card p-8 md:p-10 shadow-2xl border border-white/10"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.div
            whileHover={{ rotate: 12, scale: 1.1 }}
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary via-emerald-500 to-lime-400 text-white shadow-lg shadow-primary/25"
          >
            <span className="text-2xl font-black">G</span>
          </motion.div>

          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            Sign in to access your Grocera engine{" "}
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 rounded-2xl bg-destructive/15 border border-destructive/30 p-3.5 text-xs text-destructive text-center font-bold"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full rounded-xl border border-input/80 bg-background/80 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-input/80 bg-background/80 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-sm"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary via-emerald-500 to-lime-500 text-white font-bold py-3 rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 shadow-md shadow-primary/20 text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              "Signing in..."
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {process.env.NODE_ENV !== "production" && (
          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-foreground">
                  Local demo account
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  demo.consumer@grocera.test &middot; Demo12345!
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={useDemoCredentials}
              >
                Use demo
              </Button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm">
          <span className="text-muted-foreground">
            Don&apos;t have an account?{" "}
          </span>
          <a
            href="/register"
            className="font-bold text-primary hover:underline transition-all"
          >
            Create an account
          </a>
        </div>
      </motion.div>
    </div>
  );
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { Users, Server, Activity, ShieldAlert, Trash2, ExternalLink } from "lucide-react"

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalStores: number;
  totalActiveSubscriptions: number;
}

interface UserRecord {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

interface SystemHealth {
  uptime: number;
  memory: { rss: number };
  os: { totalmem: number };
  recentLogs: Array<{ timestamp: string; level: string; message: string }>;
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, accessToken } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'HEALTH' | 'QUEUES'>('OVERVIEW')

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<UserRecord[]>([])
  const [health, setHealth] = useState<SystemHealth | null>(null)

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'ADMIN') {
      router.push('/')
      return;
    }

    const headers = { Authorization: `Bearer ${accessToken}` }
    
    // Fetch stats
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, { headers })
      .then(res => res.json())
      .then(setStats)

    // Fetch users
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, { headers })
      .then(res => res.json())
      .then(data => setUsers(data.data || []))

    // Fetch health
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/health`, { headers })
      .then(res => res.json())
      .then(setHealth)
  }, [user, accessToken, router])

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ role: newRole })
      })
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      setUsers(users.filter(u => u.id !== userId))
    } catch (e) {
      console.error(e)
    }
  }

  if (user?.role !== 'ADMIN') return <div className="p-8">Unauthorized</div>

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-8 h-8 text-destructive" />
        <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
      </div>

      <div className="flex gap-4 border-b border-border mb-6">
        <button 
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'OVERVIEW' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('USERS')}
          className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'USERS' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          User Management
        </button>
        <button 
          onClick={() => setActiveTab('HEALTH')}
          className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'HEALTH' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          System Health
        </button>
        <button 
          onClick={() => setActiveTab('QUEUES')}
          className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'QUEUES' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Queue Management
        </button>
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color="text-blue-500" />
          <StatCard title="Products Indexed" value={stats?.totalProducts || 0} icon={Activity} color="text-green-500" />
          <StatCard title="Active Stores" value={stats?.totalStores || 0} icon={Server} color="text-orange-500" />
          <StatCard title="Active Subscriptions" value={stats?.totalActiveSubscriptions || 0} icon={ShieldAlert} color="text-purple-500" />
        </div>
      )}

      {activeTab === 'USERS' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
            <h3 className="font-semibold">Registered Users</h3>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">Add User (Coming Soon)</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={u.role} 
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-transparent border border-border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-primary"
                      >
                        <option value="CONSUMER">CONSUMER</option>
                        <option value="BUSINESS">BUSINESS</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteUser(u.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'HEALTH' && health && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-green-500"/> Process Memory (RSS)</h3>
              <div className="w-full bg-muted rounded-full h-4 mb-2 overflow-hidden">
                <div className="bg-primary h-4 rounded-full" style={{ width: `${Math.min((health.memory.rss / health.os.totalmem) * 100 * 10, 100)}%` }}></div>
              </div>
              <p className="text-sm text-muted-foreground">{(health.memory.rss / 1024 / 1024).toFixed(2)} MB Used</p>
            </div>
            
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Server className="w-5 h-5 text-blue-500"/> System Uptime</h3>
              <p className="text-3xl font-bold">{Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m</p>
              <p className="text-sm text-muted-foreground mt-2">Node.js process uptime</p>
            </div>
          </div>

          <div className="bg-black text-green-400 p-4 rounded-xl border border-border/50 font-mono text-xs overflow-hidden h-[400px] flex flex-col">
            <div className="border-b border-green-900/50 pb-2 mb-2 flex justify-between text-green-600">
              <span>Winston Server Logs (Tail)</span>
              <span>app-{new Date().toISOString().split('T')[0]}.log</span>
            </div>
            <div className="overflow-y-auto flex-1 space-y-1">
              {health.recentLogs?.length > 0 ? (
                health.recentLogs.map((log: { timestamp: string; level: string; message: string }, idx: number) => (
                  <div key={idx} className="flex gap-4 hover:bg-white/5">
                    <span className="opacity-50 min-w-[140px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-yellow-400' : ''}>[{log.level}]</span>
                    <span>{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="opacity-50">No recent logs found.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'QUEUES' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Server className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold mb-2">BullMQ Queue Management</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Monitor and manage background scraping jobs. The queue dashboard is protected by Basic Authentication. Use your admin credentials to log in.
          </p>
          <a 
            href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/admin/queues`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            Open Dashboard <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-muted/50 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

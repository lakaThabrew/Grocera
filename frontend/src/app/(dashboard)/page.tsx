"use client"

import { Activity, CreditCard, DollarSign, Users, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Mon', total: 1200 },
  { name: 'Tue', total: 2100 },
  { name: 'Wed', total: 800 },
  { name: 'Thu', total: 1600 },
  { name: 'Fri', total: 900 },
  { name: 'Sat', total: 1700 },
  { name: 'Sun', total: 2400 },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back to Grocera. Here&apos;s your overview.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Revenue", value: "$45,231.89", icon: DollarSign, trend: "+20.1%", positive: true },
          { title: "Active Users", value: "+2350", icon: Users, trend: "+180.1%", positive: true },
          { title: "Sales", value: "+12,234", icon: CreditCard, trend: "+19%", positive: true },
          { title: "Active Scrapes", value: "573", icon: Activity, trend: "-4%", positive: false },
        ].map((card, i) => (
          <div 
            key={i} 
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
              <div className="p-2 bg-muted rounded-md text-primary">
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="pt-2">
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <div className={`text-xs mt-1 flex items-center font-medium ${card.positive ? 'text-primary' : 'text-destructive'}`}>
                {card.positive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {card.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7 mt-2">
        {/* Main Chart */}
        <div className="col-span-1 lg:col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-foreground">Revenue Overview</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4, fill: 'var(--primary)' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Info / Activity */}
        <div className="col-span-1 lg:col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-foreground">Recent Activity</h3>
          </div>
          <div className="space-y-4 flex-1">
            {[
              { store: "Keells", item: "Samba Rice 5kg", change: "-$1.20", time: "2m ago", positive: true },
              { store: "Cargills", item: "Anchor Milk Powder", change: "+$0.50", time: "15m ago", positive: false },
              { store: "Arpico", item: "Fresh Apples 1kg", change: "0.00", time: "1h ago", positive: null },
              { store: "Spar", item: "Roast Chicken", change: "-$0.10", time: "2h ago", positive: true },
              { store: "Glomark", item: "Olive Oil 500ml", change: "+$2.00", time: "3h ago", positive: false },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-primary">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{activity.item}</p>
                    <p className="text-xs font-medium text-muted-foreground">{activity.store} • {activity.time}</p>
                  </div>
                </div>
                <div className={`text-sm font-bold ${activity.positive === true ? 'text-primary' : activity.positive === false ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {activity.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Activity, CreditCard, DollarSign, Users, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageWrapper } from "@/components/layout/PageWrapper"
import { motion, Variants } from "framer-motion"

const data = [
  { name: 'Mon', total: 1200 },
  { name: 'Tue', total: 2100 },
  { name: 'Wed', total: 800 },
  { name: 'Thu', total: 1600 },
  { name: 'Fri', total: 900 },
  { name: 'Sat', total: 1700 },
  { name: 'Sun', total: 2400 },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.4 } }
}

export default function DashboardPage() {
  return (
    <PageWrapper>
      {/* Hero Banner */}
      <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg mb-4 group">
        <div className="absolute inset-0 bg-[url('/images/dashboard_hero_bg.png')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-white mb-2"
          >
            Welcome back to Grocera
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/80 max-w-md text-sm md:text-base"
          >
            Your AI-powered retail intelligence dashboard is ready. Here&apos;s your overview for today.
          </motion.p>
        </div>
      </div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { title: "Total Revenue", value: "$45,231.89", icon: DollarSign, trend: "+20.1%", positive: true },
          { title: "Active Users", value: "+2350", icon: Users, trend: "+180.1%", positive: true },
          { title: "Sales", value: "+12,234", icon: CreditCard, trend: "+19%", positive: true },
          { title: "Active Scrapes", value: "573", icon: Activity, trend: "-4%", positive: false },
        ].map((card, i) => (
          <motion.div 
            variants={itemVariants}
            key={i} 
            className="rounded-xl glass-card p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group cursor-pointer"
          >
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{card.title}</h3>
              <div className="p-2 bg-primary/10 rounded-md text-primary group-hover:bg-primary group-hover:text-white transition-colors">
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
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 grid-cols-1 lg:grid-cols-7 mt-2"
      >
        {/* Main Chart */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-4 rounded-xl glass-card p-6">
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
                  cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--background)', stroke: 'var(--primary)', strokeWidth: 2 }} activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'var(--background)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Secondary Info / Activity */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-3 rounded-xl glass-card p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-foreground">Recent Activity</h3>
          </div>
          <div className="space-y-3 flex-1">
            {[
              { store: "Keells", item: "Samba Rice 5kg", change: "-$1.20", time: "2m ago", positive: true },
              { store: "Cargills", item: "Anchor Milk Powder", change: "+$0.50", time: "15m ago", positive: false },
              { store: "Arpico", item: "Fresh Apples 1kg", change: "0.00", time: "1h ago", positive: null },
              { store: "Spar", item: "Roast Chicken", change: "-$0.10", time: "2h ago", positive: true },
              { store: "Glomark", item: "Olive Oil 500ml", change: "+$2.00", time: "3h ago", positive: false },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 hover:scale-[1.01] transition-all duration-200 cursor-pointer border border-transparent hover:border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
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
        </motion.div>
      </motion.div>
    </PageWrapper>
  )
}

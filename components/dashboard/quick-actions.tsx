"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Coins, 
  Gift, 
  Users, 
  Zap 
} from "lucide-react"
import { cn } from "@/lib/utils"

const actions = [
  { 
    href: "/deposit", 
    icon: ArrowDownToLine, 
    label: "Deposit", 
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-500/10"
  },
  { 
    href: "/withdraw", 
    icon: ArrowUpFromLine, 
    label: "Withdraw", 
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-500/10"
  },
  { 
    href: "/market", 
    icon: Coins, 
    label: "Tokens", 
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10"
  },
  { 
    href: "/tasks", 
    icon: Gift, 
    label: "Check-in", 
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-500/10"
  },
  { 
    href: "/team", 
    icon: Users, 
    label: "Referrals", 
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-500/10"
  },
  { 
    href: "/rooms", 
    icon: Zap, 
    label: "Rooms", 
    color: "from-cyan-500 to-teal-600",
    bgColor: "bg-cyan-500/10"
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((action, index) => (
        <motion.div
          key={action.href}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link href={action.href}>
            <div className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl",
              "border border-zinc-800 bg-zinc-900/50",
              "hover:border-zinc-700 transition-all duration-200",
              "active:scale-95"
            )}>
              <div className={cn(
                "p-3 rounded-xl mb-2",
                action.bgColor
              )}>
                <action.icon className={cn(
                  "w-5 h-5 bg-gradient-to-r bg-clip-text",
                  action.color.replace("from-", "text-").split(" ")[0]
                )} />
              </div>
              <span className="text-xs font-medium text-zinc-300">{action.label}</span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

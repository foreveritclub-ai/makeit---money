"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  LayoutDashboard, 
  TrendingUp, 
  CheckSquare, 
  Users, 
  DoorOpen, 
  User 
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Home" },
  { href: "/market", icon: TrendingUp, label: "Market" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/team", icon: Users, label: "Team" },
  { href: "/rooms", icon: DoorOpen, label: "Rooms" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center px-3 py-2 rounded-xl transition-colors",
                isActive ? "text-blue-400" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-blue-500/10 rounded-xl"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <item.icon className={cn("w-5 h-5 relative z-10", isActive && "text-blue-400")} />
              <span className="text-[10px] mt-1 font-medium relative z-10">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

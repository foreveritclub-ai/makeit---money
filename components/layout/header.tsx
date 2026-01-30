"use client"

import { Bell, Settings, Shield } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Header() {
  const { user } = useAppStore()

  const tierColors = {
    basic: "bg-zinc-600 text-zinc-100",
    premium: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
    verified: "bg-gradient-to-r from-yellow-400 to-amber-400 text-black",
  }

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || "V"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{user?.name || "VirtuixRW"}</span>
              {user?.tier === "verified" && (
                <span className="text-yellow-400 text-sm">&#10004;</span>
              )}
            </div>
            <Badge className={tierColors[user?.tier || "basic"]} variant="secondary">
              {user?.tier === "premium" ? "Agent" : user?.tier === "verified" ? "Verified" : "Basic"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10">
              <Shield className="w-5 h-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <Bell className="w-5 h-5" />
          </Button>
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

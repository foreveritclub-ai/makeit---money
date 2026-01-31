"use client"

import { Bell, Settings, Shield, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (authUser) {
          setUser(authUser)

          // Get user profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single()

          if (profileData) {
            setProfile(profileData)
          }
        }
      } catch (error) {
        console.log("[v0] Header - error loading user data")
      }
    }

    loadUserData()
  }, [supabase])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/auth/signin")
    } catch (error) {
      console.log("[v0] Error signing out")
    }
  }

  const tierColors = {
    basic: "bg-amber-600/30 text-amber-400",
    premium: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
    verified: "bg-gradient-to-r from-yellow-400 to-amber-400 text-black",
  }

  const getUserInitial = () => {
    if (profile?.first_name) {
      return profile.first_name.charAt(0)
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "V"
  }

  const getUserName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    if (user?.email) {
      return user.email.split("@")[0]
    }
    return "Void Coin"
  }

  return (
    <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-amber-600/20">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold">
            {getUserInitial()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{getUserName()}</span>
            </div>
            <Badge className={tierColors["basic"]} variant="secondary">
              Basic
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button
              variant="ghost"
              size="icon"
              className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
            >
              <Shield className="w-5 h-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-amber-400"
          >
            <Bell className="w-5 h-5" />
          </Button>
          <Link href="/profile">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-amber-400"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  DoorOpen, 
  Users, 
  Coins, 
  Crown, 
  Plus,
  Lock,
  Sparkles,
  X
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export default function RoomsPage() {
  const { user, rooms, wallets, joinRoom, createRoom } = useAppStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRoom, setNewRoom] = useState({ name: '', entryFee: '', bonusPool: '' })
  const [joiningRoom, setJoiningRoom] = useState<string | null>(null)

  const canCreateRoom = user?.tier === 'premium' || user?.tier === 'verified'

  const handleJoinRoom = async (roomId: string) => {
    setJoiningRoom(roomId)
    await new Promise(resolve => setTimeout(resolve, 500))
    joinRoom(roomId)
    setJoiningRoom(null)
  }

  const handleCreateRoom = () => {
    if (!newRoom.name || !newRoom.entryFee || !newRoom.bonusPool) return
    createRoom(newRoom.name, parseInt(newRoom.entryFee), parseInt(newRoom.bonusPool))
    setShowCreateModal(false)
    setNewRoom({ name: '', entryFee: '', bonusPool: '' })
  }

  const roomTypeColors = {
    basic: { bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', text: 'text-zinc-400' },
    premium: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
    verified: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400' },
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <Header />
      
      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10">
              <DoorOpen className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Bonus Rooms</h1>
              <p className="text-zinc-500 text-sm">Join rooms to win bonuses</p>
            </div>
          </div>
          {canCreateRoom && (
            <Button
              onClick={() => setShowCreateModal(true)}
              size="sm"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create
            </Button>
          )}
        </motion.div>

        {/* Balance Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500">Available Balance</p>
              <p className="text-xl font-bold text-white">
                {wallets.blackBalance.toLocaleString()} <span className="text-sm text-zinc-500">FRW</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Your Tier</p>
              <p className={cn(
                "text-sm font-semibold",
                user?.tier === 'verified' ? 'text-yellow-400' :
                user?.tier === 'premium' ? 'text-amber-400' : 'text-zinc-400'
              )}>
                {user?.tier === 'premium' ? 'Agent' : user?.tier === 'verified' ? 'Verified' : 'Basic'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Room Access Info */}
        {user?.tier === 'basic' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20"
          >
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm text-amber-400 font-medium">Upgrade to Create Rooms</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Purchase an Agent token to create your own bonus rooms
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rooms List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-white">Available Rooms</h3>
          {rooms.filter(r => r.status === 'active').map((room, index) => {
            const colors = roomTypeColors[room.type]
            const canJoin = wallets.blackBalance >= room.entryFee
            const isJoining = joiningRoom === room.id

            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className={cn(
                  "p-4 rounded-2xl border transition-all",
                  colors.bg,
                  colors.border
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white">{room.name}</h4>
                      {room.type === 'verified' && (
                        <Crown className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">by {room.creatorName}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
                    room.type === 'verified' ? 'bg-yellow-500/20 text-yellow-400' :
                    room.type === 'premium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-zinc-500/20 text-zinc-400'
                  )}>
                    {room.type}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-zinc-900/50 text-center">
                    <p className="text-xs text-zinc-500">Entry Fee</p>
                    <p className="font-semibold text-white">{room.entryFee.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Coins className="w-3 h-3 text-emerald-400" />
                      <p className="text-xs text-emerald-400">Pool</p>
                    </div>
                    <p className="font-semibold text-emerald-400">{room.bonusPool.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/50 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-3 h-3 text-zinc-400" />
                      <p className="text-xs text-zinc-500">Players</p>
                    </div>
                    <p className="font-semibold text-white">{room.participants}/{room.maxParticipants}</p>
                  </div>
                </div>

                <Button
                  onClick={() => handleJoinRoom(room.id)}
                  disabled={!canJoin || isJoining || room.participants >= room.maxParticipants}
                  className={cn(
                    "w-full font-semibold",
                    canJoin && room.participants < room.maxParticipants
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-500"
                  )}
                >
                  {isJoining ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  ) : room.participants >= room.maxParticipants ? (
                    "Room Full"
                  ) : !canJoin ? (
                    "Insufficient Balance"
                  ) : (
                    <>
                      <DoorOpen className="w-4 h-4 mr-2" />
                      Join Room ({room.entryFee.toLocaleString()} FRW)
                    </>
                  )}
                </Button>
              </motion.div>
            )
          })}
        </div>

        {/* How Rooms Work */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20"
        >
          <h3 className="font-semibold text-cyan-400 mb-3">How Bonus Rooms Work</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">1.</span>
              Pay the entry fee to join a room
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">2.</span>
              Bonus pool is distributed among participants
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">3.</span>
              Higher tiers can create rooms with bigger pools
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">4.</span>
              Verified users can manage and control rooms
            </li>
          </ul>
        </motion.div>
      </main>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm p-6 rounded-2xl bg-zinc-900 border border-zinc-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Create Room</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCreateModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-zinc-300">Room Name</Label>
                  <Input
                    id="name"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    placeholder="Enter room name"
                    className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="entryFee" className="text-zinc-300">Entry Fee (FRW)</Label>
                  <Input
                    id="entryFee"
                    type="number"
                    value={newRoom.entryFee}
                    onChange={(e) => setNewRoom({ ...newRoom, entryFee: e.target.value })}
                    placeholder="e.g., 1000"
                    className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="bonusPool" className="text-zinc-300">Bonus Pool (FRW)</Label>
                  <Input
                    id="bonusPool"
                    type="number"
                    value={newRoom.bonusPool}
                    onChange={(e) => setNewRoom({ ...newRoom, bonusPool: e.target.value })}
                    placeholder="e.g., 50000"
                    className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    This amount will be deducted from your Black Wallet
                  </p>
                </div>

                <Button
                  onClick={handleCreateRoom}
                  disabled={!newRoom.name || !newRoom.entryFee || !newRoom.bonusPool}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
                >
                  Create Room
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileNav />
    </div>
  )
}

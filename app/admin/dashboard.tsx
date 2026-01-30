'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PaymentSystem, PLATFORM_MTN_PHONE, PLATFORM_MTN_OWNER } from '@/lib/payment-system'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ArrowDownCircle, ArrowUpCircle, Users, Wallet, CheckCircle2, XCircle, Loader2, Shield, RefreshCw } from 'lucide-react'

export function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('deposits')

  // Data states
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState({
    pendingDeposits: 0,
    totalDeposits: 0,
    totalUsers: 0,
    totalWithdrawals: 0
  })

  // Selected deposit for confirmation
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null)
  const [mtnReference, setMtnReference] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setIsLoading(true)
    await Promise.all([
      loadPendingDeposits(),
      loadUsers(),
      loadStats()
    ])
    setIsLoading(false)
  }

  const loadPendingDeposits = async () => {
    const result = await PaymentSystem.getPendingDeposits()
    if (result.success) {
      setPendingDeposits(result.data || [])
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setUsers(data)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadStats = async () => {
    try {
      const { data: depositData } = await supabase
        .from('deposits')
        .select('amount, status')

      const { data: userData } = await supabase
        .from('users')
        .select('id')

      const { data: withdrawalData } = await supabase
        .from('withdrawals')
        .select('amount')

      const pendingCount = depositData?.filter(d => d.status === 'processing').length || 0
      const totalDeposits = depositData?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
      const totalWithdrawals = withdrawalData?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0

      setStats({
        pendingDeposits: pendingCount,
        totalDeposits,
        totalUsers: userData?.length || 0,
        totalWithdrawals
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const confirmDeposit = async () => {
    if (!selectedDeposit || !mtnReference.trim()) {
      alert('Please enter MTN reference')
      return
    }

    setProcessingId(selectedDeposit.id)
    const result = await PaymentSystem.adminConfirmDeposit(selectedDeposit.id, mtnReference)

    if (result.success) {
      alert('Deposit confirmed!')
      loadPendingDeposits()
      setSelectedDeposit(null)
      setMtnReference('')
    } else {
      alert('Error: ' + result.error)
    }

    setProcessingId(null)
  }

  const formatNumber = (num: number) => new Intl.NumberFormat('en-RW').format(num)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-amber-500/20">
              <Shield className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-zinc-400">Manage deposits, users & platform</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={loadAllData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <ArrowDownCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Pending Deposits</p>
                  <p className="text-2xl font-bold">{stats.pendingDeposits}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Wallet className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Total Deposits</p>
                  <p className="text-lg font-bold">{formatNumber(stats.totalDeposits)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <ArrowUpCircle className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Total Withdrawals</p>
                  <p className="text-lg font-bold">{formatNumber(stats.totalWithdrawals)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="deposits" className="flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4" />
              Pending Deposits ({stats.pendingDeposits})
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users ({stats.totalUsers})
            </TabsTrigger>
          </TabsList>

          {/* Deposits Tab */}
          <TabsContent value="deposits">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle>Pending Deposits</CardTitle>
                <CardDescription className="text-xs">
                  Verify MTN transfers to {PLATFORM_MTN_PHONE} ({PLATFORM_MTN_OWNER})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingDeposits.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400">
                    <p>No pending deposits</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-zinc-800">
                          <TableHead>User</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Sent At</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingDeposits.map((deposit) => (
                          <TableRow key={deposit.id} className="border-zinc-800">
                            <TableCell>
                              <div>
                                <p className="font-medium">{deposit.users?.full_name || 'N/A'}</p>
                                <p className="text-xs text-zinc-400">{deposit.users?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-bold">
                              {formatNumber(deposit.amount)} FRW
                            </TableCell>
                            <TableCell>{deposit.phone_number}</TableCell>
                            <TableCell className="text-sm text-zinc-400">
                              {new Date(deposit.created_at).toLocaleString('en-RW')}
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    onClick={() => setSelectedDeposit(deposit)}
                                    disabled={processingId === deposit.id}
                                  >
                                    {processingId === deposit.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4 mr-1" />
                                    )}
                                    Confirm
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-zinc-900 border-zinc-800">
                                  <DialogHeader>
                                    <DialogTitle>Confirm Deposit</DialogTitle>
                                    <DialogDescription>
                                      Verify the MTN transfer before confirming
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedDeposit && (
                                    <div className="space-y-4">
                                      <div className="p-4 rounded-lg bg-zinc-800">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                          <span className="text-zinc-400">User:</span>
                                          <span className="font-medium">{selectedDeposit.users?.full_name}</span>
                                          <span className="text-zinc-400">Email:</span>
                                          <span className="font-medium">{selectedDeposit.users?.email}</span>
                                          <span className="text-zinc-400">Phone:</span>
                                          <span className="font-medium">{selectedDeposit.phone_number}</span>
                                          <span className="text-zinc-400">Amount:</span>
                                          <span className="font-bold text-green-400">
                                            {formatNumber(selectedDeposit.amount)} FRW
                                          </span>
                                          <span className="text-zinc-400">10% Profit:</span>
                                          <span className="font-bold text-emerald-400">
                                            {formatNumber(selectedDeposit.amount * 0.1)} FRW
                                          </span>
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor="mtn-ref">MTN Reference</Label>
                                        <Input
                                          id="mtn-ref"
                                          placeholder="Enter MTN transaction reference"
                                          value={mtnReference}
                                          onChange={(e) => setMtnReference(e.target.value)}
                                          className="bg-zinc-800 border-zinc-700"
                                        />
                                      </div>

                                      <div className="flex gap-2">
                                        <Button
                                          onClick={confirmDeposit}
                                          className="flex-1 bg-green-600 hover:bg-green-700"
                                          disabled={processingId !== null}
                                        >
                                          <CheckCircle2 className="h-4 w-4 mr-2" />
                                          Confirm & Credit
                                        </Button>
                                        <Button
                                          variant="outline"
                                          className="flex-1 bg-transparent"
                                          onClick={() => setSelectedDeposit(null)}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle>Platform Users</CardTitle>
                <CardDescription>Manage user accounts and monitor activity</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400">
                    <p>No users yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-zinc-800">
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>Total Deposits</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="border-zinc-800">
                            <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phone}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  user.tier === 'verified'
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    : user.tier === 'premium'
                                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                }
                              >
                                {user.tier}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-bold">
                              {formatNumber(user.total_deposits)} FRW
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  user.status === 'active'
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                                }
                                variant="outline"
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

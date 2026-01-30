"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowDownToLine, 
  Check, 
  Clock, 
  Phone,
  Sparkles,
  ChevronLeft,
  Copy,
  AlertCircle,
  FileText,
  User
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAppStore } from "@/lib/store"
import { DEPOSIT_AMOUNTS, DEPOSIT_PROFIT_RATE } from "@/lib/types"
import { cn } from "@/lib/utils"
import Link from "next/link"

const MTN_NUMBER = "0790316694"
const MTN_NAME = "Vestine Nganabashaka"

export default function DepositPage() {
  const { submitPendingDeposit, pendingDeposits, deposits, wallets, user } = useAppStore()
  const [mounted, setMounted] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [step, setStep] = useState<'select' | 'pay' | 'confirm' | 'success'>('select')
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [phone, setPhone] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmitDeposit = async () => {
    if (!selectedAmount) return
    
    // Validation
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number")
      return
    }
    if (!transactionId || transactionId.length < 5) {
      setError("Please enter the MTN transaction ID from your payment confirmation")
      return
    }
    
    setError("")
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    submitPendingDeposit(selectedAmount, phone, transactionId)
    
    setStep('success')
    setIsProcessing(false)
  }

  const userPendingDeposits = pendingDeposits.filter(d => d.userId === user?.id && d.status === 'pending')
  const recentDeposits = deposits.filter(d => d.userId === user?.id).slice(0, 5)

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 pb-24">
        <div className="h-16 bg-zinc-900/50 animate-pulse" />
        <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
          <div className="h-24 bg-zinc-800 rounded-2xl animate-pulse" />
          <div className="h-64 bg-zinc-800 rounded-2xl animate-pulse" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <Header />
      
      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Back Button */}
        {step !== 'select' && step !== 'success' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStep(step === 'confirm' ? 'pay' : 'select')
              setError("")
            }}
            className="text-zinc-400 hover:text-white -ml-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        )}

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <ArrowDownToLine className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Deposit</h1>
              <p className="text-zinc-500 text-sm">Add funds via MTN Mobile Money</p>
            </div>
          </div>
        </motion.div>

        {/* Pending Deposits Alert */}
        {userPendingDeposits.length > 0 && step === 'select' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20"
          >
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Pending Deposits</span>
            </div>
            <p className="text-sm text-zinc-400 mb-3">
              You have {userPendingDeposits.length} deposit(s) awaiting confirmation
            </p>
            {userPendingDeposits.map((d) => (
              <div key={d.id} className="p-3 rounded-xl bg-zinc-900/50 mb-2 last:mb-0">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{d.amount.toLocaleString()} FRW</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
                    Pending Review
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Submitted: {new Date(d.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Select Amount */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Current Balance */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <p className="text-xs text-zinc-500 mb-1">Current Black Wallet Balance</p>
                <p className="text-2xl font-bold text-white">
                  {wallets.blackBalance.toLocaleString()} <span className="text-sm text-zinc-500">FRW</span>
                </p>
              </div>

              {/* Amount Selection */}
              <div>
                <h3 className="font-semibold text-white mb-3">Select Amount</h3>
                <div className="grid grid-cols-2 gap-3">
                  {DEPOSIT_AMOUNTS.map((amount) => (
                    <motion.button
                      key={amount}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedAmount(amount)}
                      className={cn(
                        "p-4 rounded-2xl border transition-all text-left",
                        selectedAmount === amount
                          ? "bg-emerald-500/10 border-emerald-500/50 ring-2 ring-emerald-500/30"
                          : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                      )}
                    >
                      <p className="text-xl font-bold text-white">{amount.toLocaleString()}</p>
                      <p className="text-xs text-zinc-500">FRW</p>
                      <div className="flex items-center gap-1 mt-2 text-emerald-400">
                        <Sparkles className="w-3 h-3" />
                        <span className="text-xs">+{(amount * DEPOSIT_PROFIT_RATE).toLocaleString()} profit</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Profit Info */}
              {selectedAmount && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400 font-medium">10% Profit in 3 Hours</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Deposit {selectedAmount.toLocaleString()} FRW and receive{' '}
                    <span className="text-emerald-400 font-semibold">
                      +{(selectedAmount * DEPOSIT_PROFIT_RATE).toLocaleString()} FRW
                    </span>{' '}
                    profit automatically after 3 hours.
                  </p>
                </motion.div>
              )}

              {/* Continue Button */}
              <Button
                onClick={() => setStep('pay')}
                disabled={!selectedAmount}
                className={cn(
                  "w-full py-6 font-semibold text-lg",
                  selectedAmount
                    ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                    : "bg-zinc-800 text-zinc-500"
                )}
              >
                Continue to Payment
              </Button>

              {/* Recent Deposits */}
              {recentDeposits.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-3">Recent Deposits</h3>
                  <div className="space-y-2">
                    {recentDeposits.map((deposit) => (
                      <div
                        key={deposit.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800"
                      >
                        <div>
                          <p className="font-medium text-white">{deposit.amount.toLocaleString()} FRW</p>
                          <p className="text-xs text-zinc-500">
                            {new Date(deposit.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          deposit.status === 'profit_paid' 
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        )}>
                          {deposit.status === 'profit_paid' ? 'Profit Paid' : 'Processing'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Payment Instructions */}
          {step === 'pay' && (
            <motion.div
              key="pay"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Amount Summary */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 text-center">
                <p className="text-sm text-zinc-400 mb-1">Amount to Pay</p>
                <p className="text-4xl font-bold text-white mb-2">
                  {selectedAmount?.toLocaleString()} <span className="text-lg text-zinc-400">FRW</span>
                </p>
                <p className="text-sm text-emerald-400">
                  +{((selectedAmount || 0) * DEPOSIT_PROFIT_RATE).toLocaleString()} FRW profit in 3 hours
                </p>
              </div>

              {/* MTN Mobile Money Details */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <span className="font-bold text-black text-xl">MTN</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">MTN Mobile Money Rwanda</h3>
                    <p className="text-sm text-zinc-400">Send payment to this number</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Phone Number */}
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="text-xs text-zinc-500">Phone Number</p>
                          <p className="font-mono text-2xl font-bold text-amber-400">{MTN_NUMBER}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(MTN_NUMBER)}
                        className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Registered Name */}
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-700">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="text-xs text-zinc-500">Registered Name</p>
                        <p className="text-xl font-bold text-white">{MTN_NAME}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* USSD Code */}
                <div className="mt-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-700">
                  <p className="text-xs text-zinc-500 mb-2">Quick USSD Code (Dial this)</p>
                  <div className="flex items-center justify-between">
                    <code className="text-amber-400 font-mono text-sm bg-zinc-800 px-3 py-2 rounded-lg">
                      *182*8*1*{MTN_NUMBER}*{selectedAmount}#
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(`*182*8*1*${MTN_NUMBER}*${selectedAmount}#`)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-4 p-4 rounded-xl bg-amber-500/20 border border-amber-500/30">
                  <p className="text-sm text-amber-400 font-medium mb-2">Payment Instructions:</p>
                  <ol className="text-xs text-zinc-300 space-y-1 list-decimal list-inside">
                    <li>Send exactly <span className="font-bold text-white">{selectedAmount?.toLocaleString()} FRW</span> to the number above</li>
                    <li>Wait for MTN confirmation SMS</li>
                    <li>Copy the Transaction ID from the SMS</li>
                    <li>Click &quot;I Have Paid&quot; and enter the details</li>
                  </ol>
                </div>
              </div>

              {/* I Have Paid Button */}
              <Button
                onClick={() => setStep('confirm')}
                className="w-full py-6 font-semibold text-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
              >
                I Have Paid - Confirm Details
              </Button>
            </motion.div>
          )}

          {/* Step 3: Confirm Payment Details */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Amount Reminder */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                <p className="text-sm text-zinc-400">Payment Amount</p>
                <p className="text-2xl font-bold text-white">
                  {selectedAmount?.toLocaleString()} <span className="text-sm text-zinc-500">FRW</span>
                </p>
              </div>

              {/* Payment Confirmation Form */}
              <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Enter Payment Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Your Phone Number</label>
                    <Input
                      type="tel"
                      placeholder="07XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 py-6"
                    />
                    <p className="text-xs text-zinc-500 mt-1">The number you sent payment from</p>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">MTN Transaction ID</label>
                    <Input
                      type="text"
                      placeholder="e.g. TXN123456789"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                      className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 py-6 font-mono"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Found in your MTN confirmation SMS</p>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitDeposit}
                disabled={isProcessing}
                className="w-full py-6 font-semibold text-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Submitting...</span>
                  </motion.div>
                ) : (
                  "Submit for Confirmation"
                )}
              </Button>

              <p className="text-xs text-zinc-500 text-center">
                Your deposit will be reviewed and confirmed by our team within minutes.
              </p>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
              >
                <Clock className="w-12 h-12 text-white" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Deposit Submitted!</h2>
                <p className="text-zinc-400">
                  Your deposit of <span className="text-white font-semibold">{selectedAmount?.toLocaleString()} FRW</span> is pending review
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Awaiting Admin Confirmation</span>
                </div>
                <p className="text-sm text-zinc-500 mt-2">
                  Our team will verify your payment and credit your account shortly.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-400">
                  Once confirmed, you&apos;ll receive <span className="font-bold">+{((selectedAmount || 0) * DEPOSIT_PROFIT_RATE).toLocaleString()} FRW</span> profit in 3 hours!
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setStep('select')
                    setSelectedAmount(null)
                    setPhone("")
                    setTransactionId("")
                  }}
                  variant="outline"
                  className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Deposit More
                </Button>
                <Link href="/" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MobileNav />
    </div>
  )
}

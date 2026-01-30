"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  User, 
  Wallets, 
  UserToken, 
  Transaction, 
  Deposit, 
  CheckIn, 
  Referral, 
  Room, 
  Withdrawal,
  UserTier,
  Token,
  PendingDeposit
} from './types'
import { 
  DEPOSIT_PROFIT_RATE, 
  CHECKIN_REWARD, 
  REFERRAL_RATES, 
  VERIFIED_THRESHOLD,
  WITHDRAWAL_FEE_RATE,
  WITHDRAWAL_MIN_FEE,
  WITHDRAWAL_LIMITS
} from './types'

interface AppState {
  // User
  user: User | null
  wallets: Wallets
  isAdmin: boolean
  
  // Data
  tokens: UserToken[]
  transactions: Transaction[]
  deposits: Deposit[]
  pendingDeposits: PendingDeposit[]
  checkIns: CheckIn[]
  referrals: Referral[]
  rooms: Room[]
  withdrawals: Withdrawal[]
  
  // Last check-in times
  lastDailyCheckIn: Date | null
  lastHourlyCheckIn: Date | null
  
  // Actions
  setUser: (user: User) => void
  updateWallets: (wallets: Partial<Wallets>) => void
  setAdmin: (isAdmin: boolean) => void
  
  // Deposit
  makeDeposit: (amount: number) => void
  submitPendingDeposit: (amount: number, phone: string, transactionId: string) => void
  confirmDeposit: (depositId: string) => void
  rejectDeposit: (depositId: string) => void
  processDepositProfit: (depositId: string) => void
  
  // Tokens
  purchaseToken: (token: Token) => void
  processTokenProfit: (tokenId: string) => void
  
  // Check-ins
  claimDailyCheckIn: () => boolean
  claimHourlyCheckIn: () => boolean
  canClaimDaily: () => boolean
  canClaimHourly: () => boolean
  
  // Rooms
  joinRoom: (roomId: string) => void
  createRoom: (name: string, entryFee: number, bonusPool: number) => void
  
  // Referrals
  addReferral: (referredUser: User) => void
  processReferralCommission: (saleAmount: number, referrerId: string, level: 1 | 2 | 3) => void
  
  // Withdrawals
  requestWithdrawal: (amount: number) => { success: boolean; message: string }
  
  // Transfer between wallets
  transferToBlack: (amount: number) => void
  
  // Utility
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void
  checkTierUpgrade: () => void
  
  // Initialize demo user
  initDemoUser: () => void
}

const generateId = () => Math.random().toString(36).substring(2, 15)

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      wallets: { glassBalance: 0, blackBalance: 0 },
      isAdmin: false,
      tokens: [],
      transactions: [],
      deposits: [],
      pendingDeposits: [],
      checkIns: [],
      referrals: [],
      rooms: [
        {
          id: 'room-1',
          name: 'Starter Bonus Room',
          creatorId: 'system',
          creatorName: 'VirtuixRW',
          type: 'basic',
          entryFee: 500,
          bonusPool: 25000,
          participants: 42,
          maxParticipants: 100,
          status: 'active',
          createdAt: new Date(),
        },
        {
          id: 'room-2',
          name: 'Premium Traders',
          creatorId: 'system',
          creatorName: 'VirtuixRW',
          type: 'premium',
          entryFee: 5000,
          bonusPool: 150000,
          participants: 18,
          maxParticipants: 50,
          status: 'active',
          createdAt: new Date(),
        },
        {
          id: 'room-3',
          name: 'VIP Elite',
          creatorId: 'system',
          creatorName: 'VirtuixRW',
          type: 'verified',
          entryFee: 25000,
          bonusPool: 500000,
          participants: 8,
          maxParticipants: 20,
          status: 'active',
          createdAt: new Date(),
        },
      ],
      withdrawals: [],
      lastDailyCheckIn: null,
      lastHourlyCheckIn: null,

      // Actions
      setUser: (user) => set({ user }),
      
      updateWallets: (wallets) => set((state) => ({
        wallets: { ...state.wallets, ...wallets }
      })),
      
      setAdmin: (isAdmin) => set({ isAdmin }),

      submitPendingDeposit: (amount, phone, transactionId) => {
        const state = get()
        const pendingDeposit: PendingDeposit = {
          id: generateId(),
          oderId: 'ORD-' + Date.now().toString(36).toUpperCase(),
          userId: state.user?.id || '',
          userName: state.user?.name || '',
          phone,
          transactionId,
          amount,
          status: 'pending',
          createdAt: new Date(),
        }
        
        set((state) => ({
          pendingDeposits: [...state.pendingDeposits, pendingDeposit]
        }))
        
        return pendingDeposit
      },

      confirmDeposit: (depositId) => {
        const state = get()
        const pending = state.pendingDeposits.find(d => d.id === depositId)
        if (!pending || pending.status !== 'pending') return
        
        // Mark as confirmed
        set((state) => ({
          pendingDeposits: state.pendingDeposits.map(d => 
            d.id === depositId 
              ? { ...d, status: 'confirmed', confirmedAt: new Date(), confirmedBy: 'admin' }
              : d
          )
        }))
        
        // Process the actual deposit
        get().makeDeposit(pending.amount)
      },

      rejectDeposit: (depositId) => {
        set((state) => ({
          pendingDeposits: state.pendingDeposits.map(d => 
            d.id === depositId 
              ? { ...d, status: 'rejected' }
              : d
          )
        }))
      },

      makeDeposit: (amount) => {
        const state = get()
        const deposit: Deposit = {
          id: generateId(),
          userId: state.user?.id || '',
          amount,
          status: 'completed',
          profitPaidAt: null,
          createdAt: new Date(),
        }
        
        set((state) => ({
          deposits: [...state.deposits, deposit],
          wallets: {
            ...state.wallets,
            blackBalance: state.wallets.blackBalance + amount
          },
          user: state.user ? {
            ...state.user,
            totalDeposits: state.user.totalDeposits + amount
          } : null
        }))
        
        get().addTransaction({
          userId: state.user?.id || '',
          type: 'deposit',
          amount,
          wallet: 'black',
          balanceBefore: state.wallets.blackBalance,
          balanceAfter: state.wallets.blackBalance + amount,
          description: `Deposit of ${amount.toLocaleString()} FRW`
        })
        
        // Schedule profit (in real app, this would be a backend job)
        setTimeout(() => {
          get().processDepositProfit(deposit.id)
        }, 5000) // 5 seconds for demo (would be 3 hours in production)
        
        get().checkTierUpgrade()
      },

      processDepositProfit: (depositId) => {
        const state = get()
        const deposit = state.deposits.find(d => d.id === depositId)
        if (!deposit || deposit.status === 'profit_paid') return
        
        const profit = deposit.amount * DEPOSIT_PROFIT_RATE
        
        set((state) => ({
          deposits: state.deposits.map(d => 
            d.id === depositId ? { ...d, status: 'profit_paid', profitPaidAt: new Date() } : d
          ),
          wallets: {
            ...state.wallets,
            glassBalance: state.wallets.glassBalance + profit
          }
        }))
        
        get().addTransaction({
          userId: state.user?.id || '',
          type: 'profit',
          amount: profit,
          wallet: 'glass',
          balanceBefore: state.wallets.glassBalance,
          balanceAfter: state.wallets.glassBalance + profit,
          description: `10% deposit profit from ${deposit.amount.toLocaleString()} FRW`
        })
      },

      purchaseToken: (token) => {
        const state = get()
        if (state.wallets.blackBalance < token.price) return
        
        const userToken: UserToken = {
          id: generateId(),
          userId: state.user?.id || '',
          tokenId: token.id,
          token,
          purchaseDate: new Date(),
          daysRemaining: 90,
          totalEarned: 0,
        }
        
        // Update tier if purchasing premium token
        let newTier: UserTier = state.user?.tier || 'basic'
        if (token.tier === 'premium' && state.user?.tier === 'basic') {
          newTier = 'premium'
        }
        
        set((state) => ({
          tokens: [...state.tokens, userToken],
          wallets: {
            ...state.wallets,
            blackBalance: state.wallets.blackBalance - token.price
          },
          user: state.user ? { ...state.user, tier: newTier } : null
        }))
        
        get().addTransaction({
          userId: state.user?.id || '',
          type: 'token_profit',
          amount: -token.price,
          wallet: 'black',
          balanceBefore: state.wallets.blackBalance,
          balanceAfter: state.wallets.blackBalance - token.price,
          description: `Purchased ${token.name} token for ${token.price.toLocaleString()} FRW`
        })
        
        // Process referral commissions
        if (state.user?.referredBy) {
          get().processReferralCommission(token.price, state.user.referredBy, 1)
        }
      },

      processTokenProfit: (tokenId) => {
        const state = get()
        const userToken = state.tokens.find(t => t.id === tokenId)
        if (!userToken || userToken.daysRemaining <= 0) return
        
        const profit = userToken.token.dailyReturn
        
        set((state) => ({
          tokens: state.tokens.map(t => 
            t.id === tokenId 
              ? { ...t, daysRemaining: t.daysRemaining - 1, totalEarned: t.totalEarned + profit }
              : t
          ),
          wallets: {
            ...state.wallets,
            glassBalance: state.wallets.glassBalance + profit
          }
        }))
        
        get().addTransaction({
          userId: state.user?.id || '',
          type: 'token_profit',
          amount: profit,
          wallet: 'glass',
          balanceBefore: state.wallets.glassBalance,
          balanceAfter: state.wallets.glassBalance + profit,
          description: `Daily 12% profit from ${userToken.token.name} token`
        })
      },

      canClaimDaily: () => {
        const state = get()
        if (!state.lastDailyCheckIn) return true
        const lastClaim = new Date(state.lastDailyCheckIn)
        const now = new Date()
        return lastClaim.toDateString() !== now.toDateString()
      },

      canClaimHourly: () => {
        const state = get()
        if (!state.lastHourlyCheckIn) return true
        const lastClaim = new Date(state.lastHourlyCheckIn)
        const now = new Date()
        return now.getTime() - lastClaim.getTime() >= 3600000 // 1 hour
      },

      claimDailyCheckIn: () => {
        const state = get()
        if (!state.canClaimDaily()) return false
        
        const checkIn: CheckIn = {
          id: generateId(),
          userId: state.user?.id || '',
          type: 'daily',
          claimedAt: new Date(),
          reward: CHECKIN_REWARD,
        }
        
        set((state) => ({
          checkIns: [...state.checkIns, checkIn],
          lastDailyCheckIn: new Date(),
          wallets: {
            ...state.wallets,
            glassBalance: state.wallets.glassBalance + CHECKIN_REWARD
          },
          user: state.user ? {
            ...state.user,
            score: state.user.score + 10
          } : null
        }))
        
        get().addTransaction({
          userId: state.user?.id || '',
          type: 'checkin',
          amount: CHECKIN_REWARD,
          wallet: 'glass',
          balanceBefore: state.wallets.glassBalance,
          balanceAfter: state.wallets.glassBalance + CHECKIN_REWARD,
          description: 'Daily check-in reward'
        })
        
        return true
      },

      claimHourlyCheckIn: () => {
        const state = get()
        if (!state.canClaimHourly()) return false
        
        const checkIn: CheckIn = {
          id: generateId(),
          userId: state.user?.id || '',
          type: 'hourly',
          claimedAt: new Date(),
          reward: CHECKIN_REWARD,
        }
        
        set((state) => ({
          checkIns: [...state.checkIns, checkIn],
          lastHourlyCheckIn: new Date(),
          wallets: {
            ...state.wallets,
            glassBalance: state.wallets.glassBalance + CHECKIN_REWARD
          },
          user: state.user ? {
            ...state.user,
            score: state.user.score + 1
          } : null
        }))
        
        get().addTransaction({
          userId: state.user?.id || '',
          type: 'checkin',
          amount: CHECKIN_REWARD,
          wallet: 'glass',
          balanceBefore: state.wallets.glassBalance,
          balanceAfter: state.wallets.glassBalance + CHECKIN_REWARD,
          description: 'Hourly check-in reward'
        })
        
        return true
      },

      joinRoom: (roomId) => {
        const state = get()
        const room = state.rooms.find(r => r.id === roomId)
        if (!room || state.wallets.blackBalance < room.entryFee) return
        
        set((state) => ({
          rooms: state.rooms.map(r => 
            r.id === roomId 
              ? { ...r, participants: r.participants + 1 }
              : r
          ),
          wallets: {
            ...state.wallets,
            blackBalance: state.wallets.blackBalance - room.entryFee
          }
        }))
        
        get().addTransaction({
          userId: state.user?.id || '',
          type: 'room_bonus',
          amount: -room.entryFee,
          wallet: 'black',
          balanceBefore: state.wallets.blackBalance,
          balanceAfter: state.wallets.blackBalance - room.entryFee,
          description: `Joined room: ${room.name}`
        })
      },

      createRoom: (name, entryFee, bonusPool) => {
        const state = get()
        if (state.user?.tier === 'basic') return
        if (state.wallets.blackBalance < bonusPool) return
        
        const room: Room = {
          id: generateId(),
          name,
          creatorId: state.user?.id || '',
          creatorName: state.user?.name || '',
          type: state.user?.tier === 'verified' ? 'verified' : 'premium',
          entryFee,
          bonusPool,
          participants: 0,
          maxParticipants: state.user?.tier === 'verified' ? 100 : 50,
          status: 'active',
          createdAt: new Date(),
        }
        
        set((state) => ({
          rooms: [...state.rooms, room],
          wallets: {
            ...state.wallets,
            blackBalance: state.wallets.blackBalance - bonusPool
          }
        }))
        
        get().addTransaction({
          userId: state.user?.id || '',
          type: 'room_bonus',
          amount: -bonusPool,
          wallet: 'black',
          balanceBefore: state.wallets.blackBalance,
          balanceAfter: state.wallets.blackBalance - bonusPool,
          description: `Created room: ${name} with ${bonusPool.toLocaleString()} FRW bonus pool`
        })
      },

      addReferral: (referredUser) => {
        const state = get()
        const referral: Referral = {
          id: generateId(),
          referrerId: state.user?.id || '',
          referredId: referredUser.id,
          referredName: referredUser.name,
          level: 1,
          commission: 0,
          createdAt: new Date(),
        }
        
        set((state) => ({
          referrals: [...state.referrals, referral],
          user: state.user ? {
            ...state.user,
            score: state.user.score + 50
          } : null
        }))
      },

      processReferralCommission: (saleAmount, referrerId, level) => {
        const rate = level === 1 ? REFERRAL_RATES.level1 : level === 2 ? REFERRAL_RATES.level2 : REFERRAL_RATES.level3
        const commission = saleAmount * rate
        
        set((state) => ({
          wallets: {
            ...state.wallets,
            glassBalance: state.wallets.glassBalance + commission
          }
        }))
        
        get().addTransaction({
          userId: referrerId,
          type: 'commission',
          amount: commission,
          wallet: 'glass',
          balanceBefore: get().wallets.glassBalance - commission,
          balanceAfter: get().wallets.glassBalance,
          description: `Level ${level} referral commission (${rate * 100}%)`
        })
      },

      requestWithdrawal: (amount) => {
        const state = get()
        
        // Check if user has made a deposit
        if (state.deposits.length === 0) {
          return { success: false, message: 'You must make at least one deposit before withdrawing.' }
        }
        
        // Check balance
        if (state.wallets.blackBalance < amount) {
          return { success: false, message: 'Insufficient balance in Black Wallet.' }
        }
        
        // Check limits
        const limits = WITHDRAWAL_LIMITS[state.user?.tier || 'basic']
        if (amount > limits.daily) {
          return { success: false, message: `Daily limit exceeded. Max: ${limits.daily.toLocaleString()} FRW` }
        }
        
        const fee = Math.max(amount * WITHDRAWAL_FEE_RATE, WITHDRAWAL_MIN_FEE)
        const netAmount = amount - fee
        
        const withdrawal: Withdrawal = {
          id: generateId(),
          userId: state.user?.id || '',
          amount,
          fee,
          netAmount,
          status: 'pending',
          createdAt: new Date(),
        }
        
        set((state) => ({
          withdrawals: [...state.withdrawals, withdrawal],
          wallets: {
            ...state.wallets,
            blackBalance: state.wallets.blackBalance - amount
          }
        }))
        
        get().addTransaction({
          userId: state.user?.id || '',
          type: 'withdrawal',
          amount: -amount,
          wallet: 'black',
          balanceBefore: state.wallets.blackBalance,
          balanceAfter: state.wallets.blackBalance - amount,
          description: `Withdrawal request: ${amount.toLocaleString()} FRW (Fee: ${fee.toLocaleString()} FRW)`
        })
        
        return { success: true, message: `Withdrawal of ${netAmount.toLocaleString()} FRW submitted successfully.` }
      },

      transferToBlack: (amount) => {
        const state = get()
        if (state.wallets.glassBalance < amount) return
        
        const fee = amount * 0.01 // 1% transfer fee
        const netAmount = amount - fee
        
        set((state) => ({
          wallets: {
            glassBalance: state.wallets.glassBalance - amount,
            blackBalance: state.wallets.blackBalance + netAmount
          }
        }))
        
        get().addTransaction({
          userId: state.user?.id || '',
          type: 'transfer',
          amount: netAmount,
          wallet: 'black',
          balanceBefore: state.wallets.blackBalance,
          balanceAfter: state.wallets.blackBalance + netAmount,
          description: `Transfer from Glass to Black Wallet (1% fee: ${fee.toLocaleString()} FRW)`
        })
      },

      addTransaction: (tx) => {
        const transaction: Transaction = {
          ...tx,
          id: generateId(),
          createdAt: new Date(),
        }
        set((state) => ({
          transactions: [transaction, ...state.transactions].slice(0, 100)
        }))
      },

      checkTierUpgrade: () => {
        const state = get()
        if (!state.user) return
        
        if (state.user.totalDeposits >= VERIFIED_THRESHOLD && state.user.tier !== 'verified') {
          set((state) => ({
            user: state.user ? { ...state.user, tier: 'verified' } : null
          }))
        }
      },

      initDemoUser: () => {
        const user: User = {
          id: generateId(),
          email: 'demo@virtuixrw.com',
          phone: '+250790316694',
          name: 'Demo User',
          tier: 'basic',
          referralCode: 'VIRTUIX' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          referredBy: null,
          totalDeposits: 0,
          score: 0,
          createdAt: new Date(),
        }
        set({ 
          user,
          wallets: { glassBalance: 1000, blackBalance: 5000 }
        })
      },
    }),
    {
      name: 'virtuixrw-storage',
    }
  )
)

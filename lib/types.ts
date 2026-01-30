// User Tiers
export type UserTier = 'basic' | 'premium' | 'verified'

// User
export interface User {
  id: string
  email: string
  phone: string
  name: string
  tier: UserTier
  referralCode: string
  referredBy: string | null
  totalDeposits: number
  score: number
  createdAt: Date
  avatar?: string
}

// Wallets
export interface Wallets {
  glassBalance: number // Coins (profits, commissions, bonuses)
  blackBalance: number // FRW notes (deposits, direct earnings)
}

// Deposit amounts
export const DEPOSIT_AMOUNTS = [5000, 9000, 15000, 25000, 35000] as const
export type DepositAmount = (typeof DEPOSIT_AMOUNTS)[number]

// Token types
export type TokenColor = 'black' | 'white' | 'green' | 'blue' | 'red' | 'orange' | 'brown' | 'grey'

export interface Token {
  id: string
  name: string
  price: number
  colors: [TokenColor, TokenColor] | [TokenColor, TokenColor, TokenColor]
  dailyReturn: number // 12%
  tier: 'basic' | 'premium' | 'verified'
  daysRemaining?: number
  purchaseDate?: Date
}

// Basic tokens
export const BASIC_TOKENS: Token[] = [
  { id: 'bw-5k', name: 'Black & White', price: 5000, colors: ['black', 'white'], dailyReturn: 600, tier: 'basic' },
  { id: 'bw-9k', name: 'Black & White', price: 9000, colors: ['black', 'white'], dailyReturn: 1080, tier: 'basic' },
  { id: 'bbl-12k', name: 'Black & Blue', price: 12000, colors: ['black', 'blue'], dailyReturn: 1440, tier: 'basic' },
  { id: 'wb-25k', name: 'White & Black', price: 25000, colors: ['white', 'black'], dailyReturn: 3000, tier: 'basic' },
  { id: 'wg-35k', name: 'White & Green', price: 35000, colors: ['white', 'green'], dailyReturn: 4200, tier: 'basic' },
  { id: 'wbl-50k', name: 'White & Blue', price: 50000, colors: ['white', 'blue'], dailyReturn: 6000, tier: 'basic' },
]

// Premium tokens (Agent)
export const PREMIUM_TOKENS: Token[] = [
  { id: 'bb-80k', name: 'Black & Black', price: 80000, colors: ['black', 'black'], dailyReturn: 9600, tier: 'premium' },
  { id: 'gg-150k', name: 'Green & Green', price: 150000, colors: ['green', 'green'], dailyReturn: 18000, tier: 'premium' },
  { id: 'oo-250k', name: 'Orange & Orange', price: 250000, colors: ['orange', 'orange'], dailyReturn: 30000, tier: 'premium' },
  { id: 'brbr-350k', name: 'Brown & Brown', price: 350000, colors: ['brown', 'brown'], dailyReturn: 42000, tier: 'premium' },
  { id: 'rr-500k', name: 'Red & Red', price: 500000, colors: ['red', 'red'], dailyReturn: 60000, tier: 'premium' },
  { id: 'ww-1m', name: 'White & White', price: 1000000, colors: ['white', 'white'], dailyReturn: 120000, tier: 'premium' },
]

// Verified tokens
export const VERIFIED_TOKENS: Token[] = [
  { id: 'wog-2.5m', name: 'White Orange Green', price: 2500000, colors: ['white', 'orange', 'green'], dailyReturn: 300000, tier: 'verified' },
]

export const ALL_TOKENS = [...BASIC_TOKENS, ...PREMIUM_TOKENS, ...VERIFIED_TOKENS]

// Deposit
export interface Deposit {
  id: string
  userId: string
  amount: number
  status: 'pending' | 'completed' | 'profit_paid'
  profitPaidAt: Date | null
  createdAt: Date
}

// Pending Deposit (awaiting admin confirmation)
export interface PendingDeposit {
  id: string
  oderId: string
  userId: string
  userName: string
  phone: string
  transactionId: string
  amount: number
  status: 'pending' | 'confirmed' | 'rejected'
  createdAt: Date
  confirmedAt?: Date
  confirmedBy?: string
}

// Admin credentials
export const ADMIN_PASSWORD = "VirtuixAdmin2024"

// Check-in
export interface CheckIn {
  id: string
  userId: string
  type: 'daily' | 'hourly'
  claimedAt: Date
  reward: number // 300 FRW
}

// Room
export interface Room {
  id: string
  name: string
  creatorId: string
  creatorName: string
  type: 'basic' | 'premium' | 'verified'
  entryFee: number
  bonusPool: number
  participants: number
  maxParticipants: number
  status: 'active' | 'completed' | 'closed'
  createdAt: Date
}

// Referral
export interface Referral {
  id: string
  referrerId: string
  referredId: string
  referredName: string
  level: 1 | 2 | 3
  commission: number
  createdAt: Date
}

// Transaction
export interface Transaction {
  id: string
  userId: string
  type: 'deposit' | 'withdrawal' | 'profit' | 'commission' | 'checkin' | 'room_bonus' | 'token_profit' | 'transfer'
  amount: number
  wallet: 'glass' | 'black'
  balanceBefore: number
  balanceAfter: number
  description: string
  createdAt: Date
}

// Withdrawal
export interface Withdrawal {
  id: string
  userId: string
  amount: number
  fee: number
  netAmount: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  createdAt: Date
}

// Withdrawal limits by tier
export const WITHDRAWAL_LIMITS = {
  basic: { daily: 50000, monthly: 300000 },
  premium: { daily: 200000, monthly: 1500000 },
  verified: { daily: 500000, monthly: 5000000 },
} as const

// Token purchase record
export interface UserToken {
  id: string
  userId: string
  tokenId: string
  token: Token
  purchaseDate: Date
  daysRemaining: number
  totalEarned: number
}

// Referral commission rates
export const REFERRAL_RATES = {
  level1: 0.05, // 5%
  level2: 0.03, // 3%
  level3: 0.01, // 1%
} as const

// Check-in reward
export const CHECKIN_REWARD = 300 // FRW

// Deposit profit rate
export const DEPOSIT_PROFIT_RATE = 0.10 // 10%
export const DEPOSIT_PROFIT_DELAY_HOURS = 3

// Token profit rate
export const TOKEN_PROFIT_RATE = 0.12 // 12% daily
export const TOKEN_PROFIT_DAYS = 90

// Withdrawal fee
export const WITHDRAWAL_FEE_RATE = 0.02 // 2%
export const WITHDRAWAL_MIN_FEE = 500 // FRW

// Verified threshold
export const VERIFIED_THRESHOLD = 1100000 // 1.1M FRW

// Color map for UI
export const TOKEN_COLORS: Record<TokenColor, string> = {
  black: '#1a1a1a',
  white: '#f5f5f5',
  green: '#22c55e',
  blue: '#3b82f6',
  red: '#ef4444',
  orange: '#f97316',
  brown: '#92400e',
  grey: '#6b7280',
}

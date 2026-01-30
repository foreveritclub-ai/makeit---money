import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database operations
export type UserProfile = {
  id: string
  user_id: string
  email: string
  phone: string
  full_name: string
  tier: 'basic' | 'premium' | 'verified'
  total_deposits: number
  score: number
  referral_code: string
  created_at: string
}

export type Wallet = {
  id: string
  user_id: string
  glass_balance: number
  black_balance: number
  total_balance: number
}

export type DepositRecord = {
  id: string
  user_id: string
  amount: number
  status: 'pending' | 'processing' | 'completed'
  phone_number: string
  screenshot_url?: string
  mtn_reference?: string
  confirmed_by_admin: boolean
  confirmed_at?: string
  profit_paid: boolean
  created_at: string
}

export type UserToken = {
  id: string
  user_id: string
  token_tier_id: number
  token_id: string
  purchase_amount: number
  days_remaining: number
  total_profit_earned: number
  is_active: boolean
  purchased_at: string
}

export type Transaction = {
  id: string
  user_id: string
  type: 'deposit' | 'withdrawal' | 'token_purchase' | 'profit' | 'referral'
  amount: number
  wallet_type: 'glass' | 'black'
  balance_before: number
  balance_after: number
  reference_id?: string
  created_at: string
}

export type ProfitSchedule = {
  id: string
  user_id: string
  deposit_id?: string
  amount: number
  profit_type: 'deposit_bonus' | 'token_daily' | 'referral'
  scheduled_at: string
  executed: boolean
  created_at: string
}

import { supabase } from './supabase'

export const TOKEN_DAILY_PROFIT_RATE = 0.12 // 12% daily for 90 days

export const TOKEN_TIERS = [
  { id: 1, name: 'Black & White', colors: 'B_W', price: 5000, requiredTier: 'basic' },
  { id: 2, name: 'Black & White', colors: 'B_W', price: 9000, requiredTier: 'basic' },
  { id: 3, name: 'Black & Blue', colors: 'B_BL', price: 12000, requiredTier: 'basic' },
  { id: 4, name: 'White & Black', colors: 'W_B', price: 25000, requiredTier: 'basic' },
  { id: 5, name: 'White & Green', colors: 'W_G', price: 35000, requiredTier: 'basic' },
  { id: 6, name: 'White & Blue', colors: 'W_BL', price: 50000, requiredTier: 'basic' },
  { id: 7, name: 'Black & Black', colors: 'B_B', price: 80000, requiredTier: 'premium' },
  { id: 8, name: 'Green & Green', colors: 'G_G', price: 150000, requiredTier: 'premium' },
  { id: 9, name: 'Orange & Orange', colors: 'O_O', price: 250000, requiredTier: 'premium' },
  { id: 10, name: 'Brown & Brown', colors: 'BR_BR', price: 350000, requiredTier: 'premium' },
  { id: 11, name: 'Red & Red', colors: 'R_R', price: 500000, requiredTier: 'premium' },
  { id: 12, name: 'White & White', colors: 'W_W', price: 1000000, requiredTier: 'premium' },
  { id: 13, name: 'W-O-G Tri-Color', colors: 'W_O_G', price: 2500000, requiredTier: 'verified' }
]

export class TokenSystem {
  // Get all available tokens
  static async getTokenTiers() {
    try {
      const { data, error } = await supabase
        .from('token_tiers')
        .select('*')
        .order('price')

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Purchase token
  static async purchaseToken(userId: string, tokenTierId: number) {
    try {
      // Get token tier
      const { data: tokenTier, error: tierError } = await supabase
        .from('token_tiers')
        .select('*')
        .eq('id', tokenTierId)
        .single()

      if (tierError) throw tierError

      // Check balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('black_balance')
        .eq('user_id', userId)
        .single()

      if (walletError) throw walletError

      if (wallet.black_balance < tokenTier.price) {
        throw new Error('Insufficient balance')
      }

      // Deduct from black wallet
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          black_balance: wallet.black_balance - tokenTier.price
        })
        .eq('user_id', userId)

      if (updateError) throw updateError

      // Create token (trigger will generate token ID)
      const { data: token, error: tokenError } = await supabase
        .from('user_tokens')
        .insert({
          user_id: userId,
          token_tier_id: tokenTierId,
          purchase_amount: tokenTier.price,
          days_remaining: 90,
          is_active: true
        })
        .select()
        .single()

      if (tokenError) throw tokenError

      // Log transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'token_purchase',
          amount: -tokenTier.price,
          wallet_type: 'black',
          balance_before: wallet.black_balance,
          balance_after: wallet.black_balance - tokenTier.price,
          reference_id: token.token_id
        })

      // Schedule daily profits for 90 days
      const dailyProfit = (tokenTier.price * TOKEN_DAILY_PROFIT_RATE)
      for (let day = 1; day <= 90; day++) {
        const scheduledDate = new Date()
        scheduledDate.setDate(scheduledDate.getDate() + day)
        
        await supabase
          .from('profit_schedule')
          .insert({
            user_id: userId,
            amount: dailyProfit,
            profit_type: 'token_daily',
            scheduled_at: scheduledDate.toISOString()
          })
      }

      return { 
        success: true, 
        token,
        dailyProfit: dailyProfit.toFixed(0)
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Get user's tokens
  static async getUserTokens(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_tokens')
        .select(`
          *,
          token_tiers (
            name,
            colors,
            price
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('purchased_at', { ascending: false })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Get token by ID
  static async getTokenById(tokenId: string) {
    try {
      const { data, error } = await supabase
        .from('user_tokens')
        .select(`
          *,
          token_tiers (
            name,
            colors,
            price
          ),
          users (
            email,
            full_name
          )
        `)
        .eq('token_id', tokenId)
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Update token days remaining
  static async updateTokenDays() {
    try {
      const { error } = await supabase
        .rpc('update_token_days')

      if (error) throw error

      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }
}

import { supabase } from './supabase'

export class ProfitSystem {
  // Process scheduled profits
  static async processScheduledProfits() {
    try {
      const { data: profits, error: fetchError } = await supabase
        .from('profit_schedule')
        .select('*')
        .eq('executed', false)
        .lte('scheduled_at', new Date().toISOString())

      if (fetchError) throw fetchError

      // Process each profit
      for (const profit of profits) {
        // Add to glass wallet
        const { data: wallet, error: walletError } = await supabase
          .from('wallets')
          .select('glass_balance')
          .eq('user_id', profit.user_id)
          .single()

        if (walletError) throw walletError

        // Update wallet
        const newBalance = wallet.glass_balance + profit.amount
        const { error: updateError } = await supabase
          .from('wallets')
          .update({ glass_balance: newBalance })
          .eq('user_id', profit.user_id)

        if (updateError) throw updateError

        // Log transaction
        await supabase
          .from('transactions')
          .insert({
            user_id: profit.user_id,
            type: 'profit',
            amount: profit.amount,
            wallet_type: 'glass',
            balance_before: wallet.glass_balance,
            balance_after: newBalance,
            reference_id: profit.id
          })

        // Mark as executed
        await supabase
          .from('profit_schedule')
          .update({ executed: true })
          .eq('id', profit.id)
      }

      return { success: true, processed: profits.length }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Get pending profits for user
  static async getUserPendingProfits(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profit_schedule')
        .select('*')
        .eq('user_id', userId)
        .eq('executed', false)
        .order('scheduled_at', { ascending: true })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Get profit history for user
  static async getUserProfitHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profit_schedule')
        .select('*')
        .eq('user_id', userId)
        .eq('executed', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Calculate total pending profits
  static async getTotalPendingProfits(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profit_schedule')
        .select('amount')
        .eq('user_id', userId)
        .eq('executed', false)

      if (error) throw error

      const total = data.reduce((sum, p) => sum + parseFloat(p.amount), 0)

      return { success: true, total }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Process referral commissions
  static async processReferralCommission(userId: string, amount: number) {
    try {
      // Get all referrers (up to 3 levels)
      const levels = [5, 3, 1] // Commission percentages

      let currentUserId = userId
      for (let level = 0; level < 3; level++) {
        // Get referrer
        const { data: referral, error: refError } = await supabase
          .from('referrals')
          .select('referrer_id, commission_rate')
          .eq('referred_id', currentUserId)
          .eq('level', level + 1)
          .single()

        if (refError || !referral) break

        const referrerId = referral.referrer_id
        const commissionAmount = (amount * levels[level]) / 100

        // Get wallet
        const { data: wallet, error: walletError } = await supabase
          .from('wallets')
          .select('glass_balance')
          .eq('user_id', referrerId)
          .single()

        if (!walletError && wallet) {
          // Add commission to glass wallet
          const newBalance = wallet.glass_balance + commissionAmount
          await supabase
            .from('wallets')
            .update({ glass_balance: newBalance })
            .eq('user_id', referrerId)

          // Log transaction
          await supabase
            .from('transactions')
            .insert({
              user_id: referrerId,
              type: 'referral',
              amount: commissionAmount,
              wallet_type: 'glass',
              balance_before: wallet.glass_balance,
              balance_after: newBalance,
              reference_id: currentUserId
            })

          // Update referral total commission
          await supabase
            .from('referrals')
            .update({
              total_commission: referral.commission_rate + commissionAmount
            })
            .eq('referrer_id', referrerId)
            .eq('referred_id', currentUserId)
        }

        currentUserId = referrerId
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Check and upgrade user tier if needed
  static async checkAndUpgradeTier(userId: string) {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      // Check if should be verified
      if (user.tier !== 'verified' && user.total_deposits >= 1100000) {
        await supabase
          .from('users')
          .update({ tier: 'verified' })
          .eq('id', userId)

        return { success: true, upgraded: true, newTier: 'verified' }
      }

      return { success: true, upgraded: false }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }
}

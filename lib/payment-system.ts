import { supabase } from './supabase'

export const VALID_DEPOSIT_AMOUNTS = [5000, 9000, 15000, 25000, 35000]
export const DEPOSIT_PROFIT_RATE = 0.10 // 10% after 3 hours
export const PLATFORM_MTN_PHONE = '0790316694'
export const PLATFORM_MTN_OWNER = 'Vestine Nganabashaka'

export class PaymentSystem {
  // User initiates deposit
  static async initiateDeposit(userId: string, amount: number, phoneNumber: string) {
    try {
      if (!VALID_DEPOSIT_AMOUNTS.includes(amount)) {
        throw new Error('Invalid deposit amount')
      }

      const { data: deposit, error } = await supabase
        .from('deposits')
        .insert({
          user_id: userId,
          amount,
          phone_number: phoneNumber,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        depositId: deposit.id,
        instructions: `Send ${amount.toLocaleString('en-RW')} FRW to MTN: ${PLATFORM_MTN_PHONE}`,
        message: 'After sending, click "I\'ve Sent" and wait for admin confirmation'
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // User confirms they sent money
  static async userConfirmedPayment(depositId: string, screenshotUrl?: string) {
    try {
      const { error } = await supabase
        .from('deposits')
        .update({
          status: 'processing',
          screenshot_url: screenshotUrl
        })
        .eq('id', depositId)

      if (error) throw error

      return { success: true, message: 'Waiting for admin confirmation' }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Admin confirms deposit
  static async adminConfirmDeposit(depositId: string, mtnReference: string) {
    try {
      const { data: deposit, error: fetchError } = await supabase
        .from('deposits')
        .select('*')
        .eq('id', depositId)
        .single()

      if (fetchError) throw fetchError

      const { error } = await supabase
        .from('deposits')
        .update({
          status: 'completed',
          mtn_reference: mtnReference,
          confirmed_by_admin: true,
          confirmed_at: new Date().toISOString()
        })
        .eq('id', depositId)

      if (error) throw error

      // The database trigger will automatically:
      // 1. Add funds to user's black wallet
      // 2. Schedule 10% profit for 3 hours later
      // 3. Log transaction

      return { success: true, message: 'Deposit confirmed and profit scheduled' }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Reject deposit
  static async rejectDeposit(depositId: string, reason?: string) {
    try {
      const { error } = await supabase
        .from('deposits')
        .update({
          status: 'pending' // Reset to pending
        })
        .eq('id', depositId)

      if (error) throw error

      return { success: true, message: 'Deposit rejected' }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Get pending deposits for admin
  static async getPendingDeposits() {
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select(`
          *,
          users (
            id,
            email,
            phone,
            full_name
          )
        `)
        .eq('status', 'processing')
        .order('created_at', { ascending: false })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Get user's deposit history
  static async getUserDeposits(userId: string) {
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }
}

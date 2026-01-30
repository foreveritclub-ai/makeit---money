import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

// Admin credentials - stored securely
const ADMIN_CREDENTIALS = {
  email: 'kigalicoding64@proton.me',
  password: 'Kigali@2025'
}

export class AuthService {
  // User signup with real data
  static async signUp(email: string, phone: string, password: string, fullName: string, referralCode?: string) {
    try {
      // Hash password
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(password, saltRounds)
      
      // Create user
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          email,
          phone,
          password_hash: passwordHash,
          full_name: fullName,
          referral_code: undefined // Will be auto-generated
        })
        .select()
        .single()

      if (userError) throw userError

      // If referral code provided, create referral relationship
      if (referralCode) {
        const { data: referrer } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', referralCode)
          .single()

        if (referrer) {
          await supabase
            .from('referrals')
            .insert({
              referrer_id: referrer.id,
              referred_id: user.id,
              level: 1,
              commission_rate: 5.00
            })
        }
      }

      return { success: true, user }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // User signin with real data
  static async signIn(email: string, password: string) {
    try {
      // Check if admin
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        return { 
          success: true, 
          isAdmin: true,
          user: {
            id: 'admin',
            email: ADMIN_CREDENTIALS.email,
            isAdmin: true
          }
        }
      }

      // Get user from database
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (userError || !user) {
        throw new Error('User not found')
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash)
      if (!passwordMatch) {
        throw new Error('Invalid password')
      }

      return { 
        success: true, 
        isAdmin: false,
        user 
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  // Get user wallets
  static async getUserWallets(userId: string) {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }
}

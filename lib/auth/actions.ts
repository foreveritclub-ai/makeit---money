'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(email: string, password: string, firstName: string, lastName: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { data, success: true }
  } catch (error) {
    return { error: 'An unexpected error occurred' }
  }
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    return { data, success: true }
  } catch (error) {
    return { error: 'An unexpected error occurred' }
  }
}

export async function signOut() {
  const supabase = await createClient()

  await supabase.auth.signOut()
  redirect('/auth/signin')
}

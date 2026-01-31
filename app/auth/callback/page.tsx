import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function CallbackPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/protected/dashboard')
  } else {
    redirect('/auth/signin')
  }
}

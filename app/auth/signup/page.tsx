'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignUpPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name')
      setIsLoading(false)
      return
    }

    if (!phoneNumber.trim()) {
      setError('Please enter your phone number')
      setIsLoading(false)
      return
    }

    try {
      // Sign up with phone as username and password
      const { error: signUpError } = await supabase.auth.signUp({
        email: `${phoneNumber}@void-coin.local`,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
          },
        },
      })
      if (signUpError) throw signUpError
      router.push('/protected/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-black">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <Image
              src="/void-coin-logo.png"
              alt="Void Coin"
              width={80}
              height={80}
              className="mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-amber-500">Void Coin</h1>
          </div>

          <Card className="bg-zinc-900 border-amber-600/30">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Create Account</CardTitle>
              <CardDescription className="text-zinc-400">
                Join Void Coin and start trading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName" className="text-zinc-300">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        required
                        className="bg-zinc-800 border-amber-600/20 text-white"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName" className="text-zinc-300">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        required
                        className="bg-zinc-800 border-amber-600/20 text-white"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="text-zinc-300">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      required
                      className="bg-zinc-800 border-amber-600/20 text-white"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-zinc-300">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="bg-zinc-800 border-amber-600/20 text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password" className="text-zinc-300">
                      Confirm Password
                    </Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="bg-zinc-800 border-amber-600/20 text-white"
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded">
                      {error}
                    </p>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-zinc-400">
                  Already have an account?{' '}
                  <Link
                    href="/auth/signin"
                    className="text-amber-400 hover:text-amber-300 underline underline-offset-4"
                  >
                    Sign In
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

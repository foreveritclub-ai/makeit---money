'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AuthService } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogIn, UserPlus, Shield, Mail, Lock, Phone, User } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup form
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
  const [signupFullName, setSignupFullName] = useState('')
  const [referralCode, setReferralCode] = useState('')

  // Admin login
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await AuthService.signIn(loginEmail, loginPassword)

    if (result.success) {
      if (result.isAdmin) {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } else {
      setError(result.error || 'Login failed')
    }

    setIsLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!signupPhone.startsWith('+250')) {
      setError('Phone must start with +250')
      return
    }

    setIsLoading(true)

    const result = await AuthService.signUp(
      signupEmail,
      signupPhone,
      signupPassword,
      signupFullName,
      referralCode || undefined
    )

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Signup failed')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 mb-4"
          >
            <span className="text-2xl font-bold text-blue-400">VX</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white">VirtuixRW</h1>
          <p className="text-sm text-zinc-400 mt-2">Rwanda's Premier Trading Platform</p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Main Card */}
        <Card className="border-zinc-700 bg-zinc-900/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in or create account to start trading</CardDescription>
          </CardHeader>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mx-6 mb-4" style={{ width: 'calc(100% - 48px)' }}>
              <TabsTrigger value="login" className="text-xs">
                <LogIn className="h-4 w-4 mr-1" />
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-xs">
                <UserPlus className="h-4 w-4 mr-1" />
                Sign Up
              </TabsTrigger>
              <TabsTrigger value="admin" className="text-xs">
                <Shield className="h-4 w-4 mr-1" />
                Admin
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 bg-zinc-800 border-zinc-700"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 bg-zinc-800 border-zinc-700"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardContent className="pt-0">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </CardContent>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <Input
                        id="fullName"
                        placeholder="Your Full Name"
                        value={signupFullName}
                        onChange={(e) => setSignupFullName(e.target.value)}
                        className="pl-10 bg-zinc-800 border-zinc-700"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <Input
                        id="signupEmail"
                        type="email"
                        placeholder="you@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="pl-10 bg-zinc-800 border-zinc-700"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (+250...)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <Input
                        id="phone"
                        placeholder="+250 7XX XXX XXX"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        className="pl-10 bg-zinc-800 border-zinc-700"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <Input
                        id="signupPassword"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-10 bg-zinc-800 border-zinc-700"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        className="pl-10 bg-zinc-800 border-zinc-700"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referral">Referral Code (Optional)</Label>
                    <Input
                      id="referral"
                      placeholder="Enter referral code for bonus"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </CardContent>
                <CardContent className="pt-0">
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </CardContent>
              </form>
            </TabsContent>

            {/* Admin Tab */}
            <TabsContent value="admin">
              <form onSubmit={async (e) => {
                e.preventDefault()
                setError('')
                setIsLoading(true)

                const result = await AuthService.signIn(adminEmail, adminPassword)

                if (result.success && result.isAdmin) {
                  sessionStorage.setItem('adminToken', 'true')
                  router.push('/admin')
                } else {
                  setError('Invalid admin credentials')
                }

                setIsLoading(false)
              }}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <Input
                        id="adminEmail"
                        type="email"
                        placeholder="kigalicoding64@proton.me"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="pl-10 bg-zinc-800 border-zinc-700"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <Input
                        id="adminPassword"
                        type="password"
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="pl-10 bg-zinc-800 border-zinc-700"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardContent className="pt-0">
                  <Button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Admin Login'}
                  </Button>
                </CardContent>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <p className="text-xs text-zinc-500 text-center mt-6">
          VirtuixRW v1.0.0 • Rwanda • MTN: 0790 316 694
        </p>
      </motion.div>
    </div>
  )
}

# VirtuixRW Production Setup Guide

## Overview
VirtuixRW is a complete Rwandan trading platform with real Supabase backend, real-time profit distribution, and admin dashboard for deposit verification.

## Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account (free tier works)
- Environment variables configured

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to https://supabase.com and create a free account
2. Create a new project (keep the default settings)
3. Wait for the project to initialize
4. Go to Settings > API to find your credentials

### 1.2 Get Your Credentials
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 1.3 Run Database Schema
1. Go to Supabase Dashboard > SQL Editor
2. Click "New Query"
3. Copy the entire contents of `/scripts/create-schema.sql`
4. Paste it into the SQL editor
5. Click "Run"

Wait for all tables and functions to be created successfully.

## Step 2: Environment Configuration

### 2.1 Create `.env.local`
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2.2 Install Dependencies
```bash
npm install
# or
yarn install
```

## Step 3: Authentication

### Admin Credentials (Hardcoded)
- **Email**: `kigalicoding64@proton.me`
- **Password**: `Kigali@2025`

### User Registration Flow
1. Users can sign up with email, phone (+250...), and password
2. Phone format: `+250XXXXXXXXX` (Rwanda)
3. Passwords hashed with bcrypt
4. Automatic wallet creation on signup

## Step 4: MTN Payment Details

### Platform Account
- **Phone**: `0790316694`
- **Owner**: `Vestine Nganabashaka`
- **Valid Deposit Amounts**: 5,000 | 9,000 | 15,000 | 25,000 | 35,000 FRW

### Deposit Flow
1. User clicks "Deposit" → selects amount
2. User sends MTN transfer to `0790316694`
3. User clicks "I've Sent" with transaction details
4. Admin verifies and confirms in Admin Dashboard
5. Funds automatically credited to user's Black Wallet
6. 10% profit scheduled for 3 hours later

## Step 5: Running the App

### Development
```bash
npm run dev
```
Open http://localhost:3000

### Production Deployment

#### Option A: Vercel (Recommended)
```bash
npx vercel
```

#### Option B: Self-Hosted
```bash
npm run build
npm start
```

## Step 6: Testing the System

### 1. Create Test Account
- Go to `/auth`
- Click "Sign Up"
- Enter: email, phone (+250...), password
- Optional: use referral code

### 2. Test Deposit
- Go to Dashboard → Deposit
- Select amount (e.g., 5,000 FRW)
- Click "Deposit"
- Enter phone number
- Note: In production, actually transfer via MTN

### 3. Admin Verification
- Go to `/auth` → Admin Tab
- Login: `kigalicoding64@proton.me` / `Kigali@2025`
- View pending deposits
- Enter MTN reference and confirm

### 4. View Profits
- After 3 hours, user's Glass Wallet gets 10% profit
- Profits visible in dashboard

## System Architecture

```
Frontend (Next.js 14)
    ↓
Supabase Auth & Database
    ↓
Real-time Profit Calculations
    ↓
Admin Dashboard for Verification
```

### Database Tables
- `users` - User accounts with tier system
- `wallets` - Glass (profits) & Black (deposits)
- `deposits` - Deposit requests & history
- `user_tokens` - Purchased tokens with auto-generated IDs
- `token_tiers` - Token configurations
- `transactions` - Complete audit trail
- `profit_schedule` - Automated profit distribution
- `withdrawals` - Withdrawal requests
- `referrals` - 3-level referral system
- `bonus_rooms` - Bonus pool rooms
- `room_members` - Room membership
- `admin_logs` - Admin action history

## Key Features

### Wallet System
- **Glass Wallet**: Profits, bonuses, referral commissions (blue)
- **Black Wallet**: Deposits, investment funds (black/white)

### Profit Distribution
- **Deposits**: 10% after 3 hours
- **Tokens**: 12% daily for 90 days
- **Referrals**: 5% (L1) + 3% (L2) + 1% (L3)

### User Tiers
- **Basic**: Default, access to basic tokens
- **Premium**: Purchase premium tokens (80k+ FRW)
- **Verified**: Auto-upgrade at 1.1M FRW total deposits

### Token System
- 13 color-coded token tiers
- Automatic Token ID generation (VTX-XXXX-YYYY format)
- 12% daily returns for 90 days
- Token IDs visible on purchase

## Admin Dashboard

### Features
- Pending deposit verification
- User management
- Transaction history
- Real-time statistics
- MTN account details

### Access
- URL: `/admin`
- Credentials: See "Authentication" section above

## Troubleshooting

### "Database connection error"
- Verify Supabase URL and keys in `.env.local`
- Check Supabase project is active
- Verify SQL schema was fully executed

### "Admin login not working"
- Check email/password match exactly: `kigalicoding64@proton.me` / `Kigali@2025`
- Clear browser cache/cookies
- Try incognito window

### "Deposits not confirming"
- Verify MTN reference format
- Check database has no errors in Supabase SQL console
- Reload admin page to refresh data

## Security Notes

⚠️ **Important for Production:**
1. Change admin password immediately
2. Use strong environment variables
3. Enable Row Level Security (RLS) in Supabase
4. Implement rate limiting
5. Use HTTPS only
6. Regular security audits

## Contact & Support

**MTN Support**: 0790 316 694 (Vestine Nganabashaka)
**Platform**: VirtuixRW v1.0.0
**Deployed**: Supabase + Vercel

---
Last Updated: January 2025

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  name TEXT,
  tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic', 'premium', 'verified')),
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_deposits DECIMAL DEFAULT 0,
  score INTEGER DEFAULT 0,
  avatar TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  glass_balance DECIMAL DEFAULT 0,
  black_balance DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_tokens table
CREATE TABLE IF NOT EXISTS public.user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_id TEXT NOT NULL,
  token_name TEXT NOT NULL,
  purchase_price DECIMAL NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  days_remaining INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'claimed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deposits table
CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'profit_paid', 'rejected')),
  profit_paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pending_deposits table (awaiting admin confirmation)
CREATE TABLE IF NOT EXISTS public.pending_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  phone TEXT NOT NULL,
  transaction_id TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'profit', 'commission', 'bonus', 'transfer')),
  amount DECIMAL NOT NULL,
  from_wallet TEXT,
  to_wallet TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create check_ins table
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('daily', 'hourly')),
  reward DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  commission_earned DECIMAL DEFAULT 0,
  level INTEGER CHECK (level IN (1, 2, 3)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_fee DECIMAL NOT NULL,
  bonus_pool DECIMAL NOT NULL,
  total_members INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create room_members table
CREATE TABLE IF NOT EXISTS public.room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  fee DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles are updateable by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles are insertable by owner" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Wallets policies
CREATE POLICY "Wallets are viewable by owner" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Wallets are updateable by owner" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Wallets are insertable by owner" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User tokens policies
CREATE POLICY "User tokens are viewable by owner" ON public.user_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User tokens are insertable by owner" ON public.user_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User tokens are updateable by owner" ON public.user_tokens FOR UPDATE USING (auth.uid() = user_id);

-- Deposits policies
CREATE POLICY "Deposits are viewable by owner" ON public.deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Deposits are insertable by owner" ON public.deposits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Deposits are updateable by owner" ON public.deposits FOR UPDATE USING (auth.uid() = user_id);

-- Pending deposits policies
CREATE POLICY "Pending deposits are viewable by owner" ON public.pending_deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Pending deposits are insertable by owner" ON public.pending_deposits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Transactions are viewable by owner" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Transactions are insertable by owner" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Check-ins policies
CREATE POLICY "Check-ins are viewable by owner" ON public.check_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Check-ins are insertable by owner" ON public.check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referrals policies
CREATE POLICY "Referrals are viewable by referrer" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Referrals are insertable by referrer" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Rooms policies
CREATE POLICY "Rooms are viewable by all" ON public.rooms FOR SELECT USING (TRUE);
CREATE POLICY "Rooms are creatable by authenticated users" ON public.rooms FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Room members policies
CREATE POLICY "Room members are viewable by all" ON public.room_members FOR SELECT USING (TRUE);
CREATE POLICY "Room members are insertable by user" ON public.room_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Withdrawals policies
CREATE POLICY "Withdrawals are viewable by owner" ON public.withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Withdrawals are insertable by owner" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_profiles_tier ON public.profiles(tier);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX idx_deposits_status ON public.deposits(status);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_user_tokens_user_id ON public.user_tokens(user_id);
CREATE INDEX idx_check_ins_user_id ON public.check_ins(user_id);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_room_members_user_id ON public.room_members(user_id);

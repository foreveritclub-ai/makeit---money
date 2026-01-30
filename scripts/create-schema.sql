-- VIRTUIXRW PRODUCTION DATABASE SCHEMA
-- Execute in Supabase SQL Editor

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    referral_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
    tier VARCHAR(20) DEFAULT 'basic',
    total_deposits DECIMAL(20,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WALLETS TABLE
CREATE TABLE IF NOT EXISTS wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
    glass_balance DECIMAL(20,2) DEFAULT 0.00,
    black_balance DECIMAL(20,2) DEFAULT 0.00,
    total_balance DECIMAL(20,2) GENERATED ALWAYS AS (glass_balance + black_balance) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DEPOSITS TABLE
CREATE TABLE IF NOT EXISTS deposits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    amount DECIMAL(20,2) NOT NULL CHECK (amount IN (5000, 9000, 15000, 25000, 35000)),
    status VARCHAR(20) DEFAULT 'pending',
    phone_number TEXT NOT NULL,
    screenshot_url TEXT,
    mtn_reference TEXT,
    confirmed_by_admin BOOLEAN DEFAULT FALSE,
    confirmed_at TIMESTAMPTZ,
    profit_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TOKEN TIERS TABLE
CREATE TABLE IF NOT EXISTS token_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    colors VARCHAR(50) NOT NULL,
    price DECIMAL(20,2) NOT NULL,
    required_tier VARCHAR(20) NOT NULL
);

-- Insert token tiers
INSERT INTO token_tiers (name, colors, price, required_tier) VALUES
    ('Black & White', 'B_W', 5000.00, 'basic'),
    ('Black & White', 'B_W', 9000.00, 'basic'),
    ('Black & Blue', 'B_BL', 12000.00, 'basic'),
    ('White & Black', 'W_B', 25000.00, 'basic'),
    ('White & Green', 'W_G', 35000.00, 'basic'),
    ('White & Blue', 'W_BL', 50000.00, 'basic'),
    ('Black & Black', 'B_B', 80000.00, 'premium'),
    ('Green & Green', 'G_G', 150000.00, 'premium'),
    ('Orange & Orange', 'O_O', 250000.00, 'premium'),
    ('Brown & Brown', 'BR_BR', 350000.00, 'premium'),
    ('Red & Red', 'R_R', 500000.00, 'premium'),
    ('White & White', 'W_W', 1000000.00, 'premium'),
    ('W-O-G Tri-Color', 'W_O_G', 2500000.00, 'verified')
ON CONFLICT DO NOTHING;

-- 5. USER TOKENS TABLE
CREATE TABLE IF NOT EXISTS user_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    token_tier_id INTEGER REFERENCES token_tiers(id) NOT NULL,
    token_id VARCHAR(20) UNIQUE,
    purchase_amount DECIMAL(20,2) NOT NULL,
    days_remaining INTEGER DEFAULT 90,
    total_profit_earned DECIMAL(20,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(20,2) NOT NULL,
    wallet_type VARCHAR(10),
    balance_before DECIMAL(20,2) NOT NULL,
    balance_after DECIMAL(20,2) NOT NULL,
    reference_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROFIT SCHEDULE TABLE
CREATE TABLE IF NOT EXISTS profit_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    deposit_id UUID REFERENCES deposits(id),
    amount DECIMAL(20,2) NOT NULL,
    profit_type VARCHAR(50) NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    executed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    amount DECIMAL(20,2) NOT NULL,
    fee DECIMAL(20,2) DEFAULT 0,
    net_amount DECIMAL(20,2) NOT NULL,
    wallet_type VARCHAR(10) NOT NULL,
    phone_number TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES users(id),
    rejection_reason TEXT
);

-- 9. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES users(id) NOT NULL,
    referred_id UUID REFERENCES users(id) NOT NULL,
    level INTEGER DEFAULT 1,
    commission_rate DECIMAL(5,2) DEFAULT 5.00,
    total_commission DECIMAL(20,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. BONUS ROOMS TABLE
CREATE TABLE IF NOT EXISTS bonus_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_by UUID REFERENCES users(id) NOT NULL,
    room_name TEXT NOT NULL,
    required_tier VARCHAR(20) NOT NULL,
    bonus_pool DECIMAL(20,2) DEFAULT 0.00,
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ROOM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS room_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES bonus_rooms(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- 12. ADMIN LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES users(id) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRIGGERS AND FUNCTIONS

-- Function to generate Token ID
CREATE OR REPLACE FUNCTION generate_token_id()
RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN 'VTX-' || 
           LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || '-' ||
           LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set Token ID
CREATE OR REPLACE FUNCTION set_token_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.token_id IS NULL THEN
        NEW.token_id := generate_token_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_token_id ON user_tokens;
CREATE TRIGGER trigger_token_id
BEFORE INSERT ON user_tokens
FOR EACH ROW
EXECUTE FUNCTION set_token_id();

-- Function to create wallet on user signup
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallets (user_id, glass_balance, black_balance)
    VALUES (NEW.id, 0.00, 0.00);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_wallet ON users;
CREATE TRIGGER trigger_create_wallet
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_user_wallet();

-- Function to process deposit confirmation
CREATE OR REPLACE FUNCTION process_deposit_confirmation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Add to black wallet
        UPDATE wallets 
        SET black_balance = black_balance + NEW.amount
        WHERE user_id = NEW.user_id;
        
        -- Update user total deposits
        UPDATE users 
        SET total_deposits = total_deposits + NEW.amount
        WHERE id = NEW.user_id;
        
        -- Schedule 10% profit after 3 hours
        INSERT INTO profit_schedule (user_id, deposit_id, amount, profit_type, scheduled_at)
        VALUES (
            NEW.user_id,
            NEW.id,
            NEW.amount * 0.10,
            'deposit_bonus',
            NOW() + INTERVAL '3 hours'
        );
        
        -- Log transaction
        INSERT INTO transactions (user_id, type, amount, wallet_type, balance_before, balance_after, reference_id)
        SELECT 
            NEW.user_id,
            'deposit',
            NEW.amount,
            'black',
            black_balance,
            black_balance + NEW.amount,
            NEW.id::TEXT
        FROM wallets WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_deposit_confirmation ON deposits;
CREATE TRIGGER trigger_deposit_confirmation
AFTER UPDATE ON deposits
FOR EACH ROW
EXECUTE FUNCTION process_deposit_confirmation();

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_deposits_user_id ON deposits(user_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_tokens_user_id ON user_tokens(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_profit_schedule_executed ON profit_schedule(executed);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);

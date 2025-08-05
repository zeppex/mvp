-- Add Hedera fields to branches table
ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS hedera_account_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS hedera_public_key TEXT,
ADD COLUMN IF NOT EXISTS hedera_private_key TEXT,
ADD COLUMN IF NOT EXISTS zeppex_token_balance DECIMAL(18,8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS hbar_balance DECIMAL(18,8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_balance_update TIMESTAMP;

-- Add Hedera fields to merchants table
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS total_zeppex_token_balance DECIMAL(18,8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_hbar_balance DECIMAL(18,8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_balance_update TIMESTAMP;

-- Add completed_at field to payment_orders table if it doesn't exist
ALTER TABLE payment_orders 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Create index for better performance on balance queries
CREATE INDEX IF NOT EXISTS idx_branches_merchant_id ON branches(merchant_id);
CREATE INDEX IF NOT EXISTS idx_branches_hedera_account_id ON branches(hedera_account_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_completed_at ON payment_orders(completed_at); 
-- Migration: Fix branch-merchant relationship
-- This migration ensures the merchantId column exists and is properly set up in the branches table

-- Add merchantId column to branches table if it doesn't exist
ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS merchant_id UUID;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_branches_merchant_id' 
        AND table_name = 'branches'
    ) THEN
        ALTER TABLE branches 
        ADD CONSTRAINT fk_branches_merchant_id 
        FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create index for better performance on merchant queries
CREATE INDEX IF NOT EXISTS idx_branches_merchant_id ON branches(merchant_id);

-- Update any existing branches that might have null merchant_id
-- This is a safety measure in case there are existing branches without merchant_id
-- Note: This should be empty if the relationship was working correctly
UPDATE branches 
SET merchant_id = (
    SELECT m.id 
    FROM merchants m 
    WHERE m.id = branches.merchant_id
) 
WHERE merchant_id IS NULL;

-- Fix POS-branch relationship
-- Add branchId column to pos table if it doesn't exist
ALTER TABLE pos 
ADD COLUMN IF NOT EXISTS branch_id UUID;

-- Add foreign key constraint for pos-branch relationship if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_pos_branch_id' 
        AND table_name = 'pos'
    ) THEN
        ALTER TABLE pos 
        ADD CONSTRAINT fk_pos_branch_id 
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create index for better performance on branch queries
CREATE INDEX IF NOT EXISTS idx_pos_branch_id ON pos(branch_id);

-- Update any existing pos records that might have null branch_id
-- This is a safety measure in case there are existing pos records without branch_id
UPDATE pos 
SET branch_id = (
    SELECT b.id 
    FROM branches b 
    WHERE b.id = pos.branch_id
) 
WHERE branch_id IS NULL;

-- Fix payment_order relationships
-- Add branchId and posId columns to payment_orders table if they don't exist
ALTER TABLE payment_orders 
ADD COLUMN IF NOT EXISTS branch_id UUID,
ADD COLUMN IF NOT EXISTS pos_id UUID;

-- Add foreign key constraints for payment_order relationships if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_payment_orders_branch_id' 
        AND table_name = 'payment_orders'
    ) THEN
        ALTER TABLE payment_orders 
        ADD CONSTRAINT fk_payment_orders_branch_id 
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_payment_orders_pos_id' 
        AND table_name = 'payment_orders'
    ) THEN
        ALTER TABLE payment_orders 
        ADD CONSTRAINT fk_payment_orders_pos_id 
        FOREIGN KEY (pos_id) REFERENCES pos(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for better performance on payment order queries
CREATE INDEX IF NOT EXISTS idx_payment_orders_branch_id ON payment_orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_pos_id ON payment_orders(pos_id);

-- Update any existing payment_orders records that might have null foreign keys
-- This is a safety measure in case there are existing records without proper foreign keys
UPDATE payment_orders 
SET branch_id = (
    SELECT b.id 
    FROM branches b 
    WHERE b.id = payment_orders.branch_id
) 
WHERE branch_id IS NULL;

UPDATE payment_orders 
SET pos_id = (
    SELECT p.id 
    FROM pos p 
    WHERE p.id = payment_orders.pos_id
) 
WHERE pos_id IS NULL; 
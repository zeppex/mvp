-- Migration: Add soft delete fields to entities
-- This migration adds fields needed for soft delete functionality

-- Add fields to branches table
ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS original_name VARCHAR,
ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP;

-- Add fields to pos table  
ALTER TABLE pos 
ADD COLUMN IF NOT EXISTS original_name VARCHAR,
ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP;

-- Add field to payment_orders table
ALTER TABLE payment_orders 
ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP;

-- Update cascade relationships
-- Note: These will be handled by TypeORM entity definitions with onDelete: 'CASCADE'
-- The existing foreign key constraints should already be set up correctly

-- Add indexes for better performance on soft delete queries
CREATE INDEX IF NOT EXISTS idx_branches_is_active ON branches(is_active);
CREATE INDEX IF NOT EXISTS idx_pos_is_active ON pos(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_orders_deactivated_at ON payment_orders(deactivated_at);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status); 
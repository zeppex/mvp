-- Add new columns to payment_orders table
ALTER TABLE payment_orders 
ADD COLUMN exchange VARCHAR(20) DEFAULT 'binance',
ADD COLUMN metadata JSONB,
ADD COLUMN "externalTransactionId" TEXT,
ADD COLUMN "errorMessage" TEXT;

-- Create enum type for exchange if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "ExchangeType" AS ENUM ('binance', 'coinbase', 'kraken');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update the exchange column to use the enum type
ALTER TABLE payment_orders 
ALTER COLUMN exchange TYPE "ExchangeType" USING exchange::"ExchangeType"; 
-- Migration: Add billing and subscription fields to Organization model
-- Date: 2024-11-22
-- Description: Enhance Organization model with comprehensive plan management and billing

-- Add new columns to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS monthly_price FLOAT DEFAULT 1950.00;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT TRUE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'trial';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS billing_email VARCHAR(120);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(100) UNIQUE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(100) UNIQUE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS customer_count INTEGER DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS user_count INTEGER DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

-- Update existing records with default values
UPDATE organizations 
SET 
    monthly_price = CASE plan_tier
        WHEN 'starter' THEN 1950.00
        WHEN 'growth' THEN 3950.00
        WHEN 'enterprise' THEN 5950.00
        ELSE 1950.00
    END,
    customer_limit = CASE plan_tier
        WHEN 'starter' THEN 100
        WHEN 'growth' THEN 300
        WHEN 'enterprise' THEN 1000
        ELSE 100
    END,
    is_trial = TRUE,
    trial_ends_at = CURRENT_TIMESTAMP + INTERVAL '14 days',
    subscription_status = 'trial'
WHERE monthly_price IS NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_status ON organizations(subscription_status);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON organizations(is_active);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer_id ON organizations(stripe_customer_id);

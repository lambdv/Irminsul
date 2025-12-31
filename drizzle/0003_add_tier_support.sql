-- Add tier support to aitoken table
ALTER TABLE aitoken 
ADD COLUMN tier VARCHAR(20) DEFAULT 'free' NOT NULL;

-- Update existing records to have appropriate tiers
UPDATE aitoken SET tier = 'free' WHERE type = 'free';

-- Add index for faster tier queries
CREATE INDEX idx_aitoken_tier ON aitoken(tier);

-- Add tier column to purchases table if it doesn't exist
ALTER TABLE purchases 
ADD COLUMN tier VARCHAR(20) DEFAULT 'supporter' NOT NULL;
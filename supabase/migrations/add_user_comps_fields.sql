-- Add user-created comp fields to tft_comps table
-- This allows all users to create and share comps

ALTER TABLE tft_comps
ADD COLUMN IF NOT EXISTS creator_discord_id text,
ADD COLUMN IF NOT EXISTS creator_riot_id text,
ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS playstyle text DEFAULT 'balanced',
ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS upvotes int DEFAULT 0;

-- Make some existing fields nullable for user-created comps
ALTER TABLE tft_comps
ALTER COLUMN carry_api_name DROP NOT NULL,
ALTER COLUMN tier DROP DEFAULT;

-- Add indexes for filtering
CREATE INDEX IF NOT EXISTS idx_tft_comps_difficulty ON tft_comps(difficulty);
CREATE INDEX IF NOT EXISTS idx_tft_comps_playstyle ON tft_comps(playstyle);
CREATE INDEX IF NOT EXISTS idx_tft_comps_creator ON tft_comps(creator_discord_id);
CREATE INDEX IF NOT EXISTS idx_tft_comps_upvotes ON tft_comps(upvotes DESC);

-- Add comment
COMMENT ON COLUMN tft_comps.difficulty IS 'Difficulty level: easy, medium, hard';
COMMENT ON COLUMN tft_comps.playstyle IS 'Playstyle: aggressive, balanced, defensive, economy, flex';
COMMENT ON COLUMN tft_comps.items IS 'Item builds: {"unit_name": ["item1", "item2"]}';

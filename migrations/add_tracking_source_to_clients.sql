-- Add tracking_source and instagram_username columns to clients table

-- Add tracking_source column
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS tracking_source TEXT CHECK (tracking_source IN ('instagram_only', 'whatsapp_only'));

-- Add instagram_username column
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS instagram_username TEXT;

-- Add index on tracking_source for faster queries
CREATE INDEX IF NOT EXISTS idx_clients_tracking_source ON clients(tracking_source);

-- Add index on instagram_username for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_instagram_username ON clients(instagram_username);

-- Add comment to columns
COMMENT ON COLUMN clients.tracking_source IS 'Source of the lead: instagram_only or whatsapp_only';
COMMENT ON COLUMN clients.instagram_username IS 'Instagram username if source is instagram_only';

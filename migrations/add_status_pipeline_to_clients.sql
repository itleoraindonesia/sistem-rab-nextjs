-- Add status column using sales_stage Enum
-- Ensure Type exists: CREATE TYPE sales_stage AS ENUM ('IG_Lead', 'WA_Negotiation', 'Quotation_Sent', 'Follow_Up', 'Invoice_Deal', 'WIP', 'Finish', 'Cancelled');

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS status sales_stage;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- Add comment
COMMENT ON COLUMN clients.status IS 'Pipeline Stage using sales_stage Enum';

-- Add audit columns to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id);

-- Add comments
COMMENT ON COLUMN clients.created_by IS 'User ID who created the record';
COMMENT ON COLUMN clients.updated_by IS 'User ID who last updated the record';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);

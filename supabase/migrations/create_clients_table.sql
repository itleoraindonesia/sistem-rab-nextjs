-- Create clients table for CRM
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  kebutuhan VARCHAR(50) NOT NULL CHECK (kebutuhan IN (
    'Pagar', 'Gudang', 'Kos/Kontrakan', 'Toko/Ruko', 
    'Rumah', 'Villa', 'Hotel', 'Rumah Sakit', 'Panel Saja'
  )),
  lokasi VARCHAR(200) NOT NULL,
  luasan DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_lokasi ON clients(lokasi);
CREATE INDEX IF NOT EXISTS idx_clients_kebutuhan ON clients(kebutuhan);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_nama ON clients(nama);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO clients (nama, whatsapp, kebutuhan, lokasi, luasan) VALUES
  ('Budi Santoso', '628123456789', 'Rumah', 'Depok', 200),
  ('Ani Wijaya', '628124567890', 'Pagar', 'Bandung', 50),
  ('Dodi Hermawan', '628125678901', 'Kos/Kontrakan', 'Solo', 150),
  ('Siti Rahayu', '628126789012', 'Toko/Ruko', 'Jakarta Selatan', 80),
  ('Ahmad Fauzi', '628127890123', 'Gudang', 'Semarang', 500);

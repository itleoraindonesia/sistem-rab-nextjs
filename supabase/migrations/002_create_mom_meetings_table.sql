-- Create mom_meetings table for meetings
CREATE TABLE IF NOT EXISTS mom_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_number VARCHAR(50) UNIQUE,
  title VARCHAR(255) NOT NULL,
  meeting_type VARCHAR(20) NOT NULL CHECK (meeting_type IN ('internal', 'external')),
  meeting_date TIMESTAMP NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  participants TEXT[] NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_mom_meetings_meeting_number ON mom_meetings(meeting_number);
CREATE INDEX idx_mom_meetings_meeting_date ON mom_meetings(meeting_date);
CREATE INDEX idx_mom_meetings_created_by ON mom_meetings(created_by);
CREATE INDEX idx_mom_meetings_status ON mom_meetings(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_mom_meetings_updated_at_column()
RETURNS TRIGGER AS 4421
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
4421 LANGUAGE plpgsql;

CREATE TRIGGER update_mom_meetings_updated_at
  BEFORE UPDATE ON mom_meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_mom_meetings_updated_at_column();

-- Create promo codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON public.promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_dates ON public.promo_codes(start_date, end_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow read access to authenticated users" ON public.promo_codes
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow insert access to service role" ON public.promo_codes
    FOR INSERT TO service_role
    WITH CHECK (true);

CREATE POLICY "Allow update access to service role" ON public.promo_codes
    FOR UPDATE TO service_role
    USING (true);

CREATE POLICY "Allow delete access to service role" ON public.promo_codes
    FOR DELETE TO service_role
    USING (true);

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_promo_codes_updated_at 
    BEFORE UPDATE ON public.promo_codes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
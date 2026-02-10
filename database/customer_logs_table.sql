-- Create customer_logs table
CREATE TABLE IF NOT EXISTS public.customer_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    logged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    check_out_time TIMESTAMP WITH TIME ZONE,
    log_type VARCHAR(20) NOT NULL CHECK (log_type IN ('walk-in', 'member', 'day-pass', 'night-pass', '1-day', 'weekly', 'monthly')),
    membership_type VARCHAR(20) CHECK (membership_type IN ('student', 'professional')),
    pass_type VARCHAR(20) CHECK (pass_type IN ('walk-in', 'day-pass', 'night-pass', '1-day', 'weekly', 'monthly')),
    amount_paid DECIMAL(10,2),
    notes TEXT,
    promo_code_used VARCHAR(50),
    discount_applied DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_logs_customer_id ON public.customer_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_logs_logged_by ON public.customer_logs(logged_by);
CREATE INDEX IF NOT EXISTS idx_customer_logs_check_in_time ON public.customer_logs(check_in_time);
CREATE INDEX IF NOT EXISTS idx_customer_logs_log_type ON public.customer_logs(log_type);

-- Enable RLS (Row Level Security)
ALTER TABLE public.customer_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own logs" ON public.customer_logs
    FOR SELECT TO authenticated
    USING (auth.uid() = logged_by OR EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'staff')
    ));

CREATE POLICY "Staff and admins can create logs" ON public.customer_logs
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'staff')
    ));

CREATE POLICY "Users can update their own logs" ON public.customer_logs
    FOR UPDATE TO authenticated
    USING (auth.uid() = logged_by OR EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'staff')
    ));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_logs_updated_at 
    BEFORE UPDATE ON public.customer_logs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
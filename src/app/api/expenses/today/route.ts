import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has staff or admin role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (!profile || !['admin', 'staff'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    // Sum the total revenue for today from customer_logs
    const { data: totalRevenueData, error } = await supabase
      .from('customer_logs')
      .select('amount_paid')
      .gte('check_in_time', startOfDay)
      .lt('check_in_time', endOfDay);

    if (error) {
      console.error('Error fetching today\'s revenue:', error);
      return NextResponse.json(
        { error: 'Failed to fetch today\'s revenue', details: error.message },
        { status: 500 }
      );
    }

    // Calculate the total
    const totalRevenue = totalRevenueData?.reduce((sum, log) => sum + (log.amount_paid || 0), 0) || 0;

    return NextResponse.json(
      { total: totalRevenue },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in today\'s revenue API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
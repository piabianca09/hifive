import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isPassValid } from '@/lib/utils/timeUtils';

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

    // Get all customer logs
    const { data: allLogs, error } = await supabase
      .from('customer_logs')
      .select('*, customers(first_name, last_name)')
      .order('check_in_time', { ascending: false });

    if (error) {
      console.error('Error fetching customer logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customer logs', details: error.message },
        { status: 500 }
      );
    }

    // Filter for active customers based on pass validity
    const activeCustomers = allLogs?.filter(log => {
      // For walk-in customers, they're active if they haven't checked out yet
      if (log.pass_type === 'walk-in') {
        return !log.check_out_time;
      }
      // For other pass types, check if the pass is still valid
      else {
        return isPassValid(log.pass_type, log.check_in_time);
      }
    }) || [];

    return NextResponse.json(
      { count: activeCustomers.length, data: activeCustomers },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in active check-ins API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
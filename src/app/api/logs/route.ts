import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!['admin', 'staff'].includes(profile?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If ?top=true, return top customers by log count
    const url = new URL(request.url);
    if (url.searchParams.get('top') === 'true') {
      // Aggregate logs by customer_id (Supabase: use select with count and group by syntax)
      const { data, error } = await supabase
        .from('customer_logs')
        .select('customer_id, count:customer_id')
        .order('count', { ascending: false })
        .limit(10);
      if (error || !Array.isArray(data)) {
        return NextResponse.json([], { status: 200 });
      }
      // Join with customers table for names
      const customerIds = data.map((row: any) => row.customer_id);
      let customers: any[] = [];
      if (customerIds.length > 0) {
        const { data: customersData } = await supabase
          .from('customers')
          .select('id, first_name, last_name')
          .in('id', customerIds);
        customers = customersData ?? [];
      }
      const result = data.map((row: any) => {
        const customer = customers.find((c: any) => c.id === row.customer_id);
        return {
          customer_id: row.customer_id,
          name: customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown',
          count: row.count,
        };
      });
      return NextResponse.json(Array.isArray(result) ? result : []);
    }

    // Default: today's logs
    const today = new Date().toISOString().split('T')[0];
    const { data: logs, error } = await supabase
      .from('customer_logs')
      .select('*, customers(first_name, last_name)')
      .gte('created_at', today)
      .order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!['admin', 'staff'].includes(profile?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const { data: log, error } = await supabase
      .from('customer_logs')
      .insert({
        ...body,
        logged_by: user.id,
      })
      .select('*, customers(first_name, last_name)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

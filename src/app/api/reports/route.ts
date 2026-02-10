import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'daily';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build the query based on report type
    let query = supabase
      .from('customer_logs')
      .select('amount_paid, check_in_time, pass_type')
      .gte('check_in_time', new Date().toISOString());

    switch (type) {
      case 'daily':
        query = supabase
          .from('customer_logs')
          .select('amount_paid, check_in_time, pass_type')
          .gte('check_in_time', new Date().toISOString().split('T')[0])
          .lte('check_in_time', new Date().toISOString());
        break;
      case 'weekly':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = supabase
          .from('customer_logs')
          .select('amount_paid, check_in_time, pass_type')
          .gte('check_in_time', weekAgo.toISOString());
        break;
      case 'monthly':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = supabase
          .from('customer_logs')
          .select('amount_paid, check_in_time, pass_type')
          .gte('check_in_time', monthAgo.toISOString());
        break;
      case 'range':
        if (startDate && endDate) {
          query = supabase
            .from('customer_logs')
            .select('amount_paid, check_in_time, pass_type')
            .gte('check_in_time', new Date(startDate).toISOString())
            .lte('check_in_time', new Date(endDate).toISOString());
        }
        break;
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sales data:', error);
      return NextResponse.json({ error: 'Failed to fetch sales data', details: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ totalSales: 0, transactions: 0, dailyAverage: 0, topProducts: [] });
    }

    // Calculate report metrics
    const totalSales = data.reduce((sum, log) => sum + (log.amount_paid || 0), 0);
    const transactions = data.length;
    const dailyAverage = transactions > 0 ? totalSales / transactions : 0;
    
    // Calculate top pass types (as proxy for products)
    const passTypeCounts: Record<string, number> = {};
    data.forEach(log => {
      if (log.pass_type) {
        passTypeCounts[log.pass_type] = (passTypeCounts[log.pass_type] || 0) + 1;
      }
    });
    
    const topProducts = Object.entries(passTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([type]) => type)
      .slice(0, 5);

    return NextResponse.json({
      totalSales,
      transactions,
      dailyAverage,
      topProducts
    });
  } catch (error: any) {
    console.error('Error in GET /api/reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
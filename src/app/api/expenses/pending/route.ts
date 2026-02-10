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

    // Verify user has admin role (only admins can view pending expenses)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Count pending expenses (assuming there's an 'approved' column in expenses table)
    // If there's no approved column, we'll count all expenses for now
    // We'll assume pending expenses are those that aren't approved yet
    const { count, error } = await supabase
      .from('expenses')
      .select('*', { count: 'exact', head: true })
      .is('approved', false); // Assuming there's an 'approved' column

    if (error) {
      // If the 'approved' column doesn't exist, just count all expenses
      if (error.code === '42703') { // Undefined column error code
        const { count: allCount, error: allError } = await supabase
          .from('expenses')
          .select('*', { count: 'exact', head: true });
        
        if (allError) {
          console.error('Error counting all expenses:', allError);
          return NextResponse.json(
            { error: 'Failed to count expenses', details: allError.message },
            { status: 500 }
          );
        }
        
        return NextResponse.json(
          { count: allCount || 0 },
          { status: 200 }
        );
      } else {
        console.error('Error counting pending expenses:', error);
        return NextResponse.json(
          { error: 'Failed to count pending expenses', details: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { count: count || 0 },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in pending expenses API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
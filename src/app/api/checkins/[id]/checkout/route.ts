import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { id } = params;
    const body = await request.json();
    
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

    // Get the existing log to verify it's a walk-in and hasn't been checked out yet
    const { data: existingLog, error: fetchError } = await supabase
      .from('customer_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingLog) {
      return NextResponse.json({ error: 'Check-in record not found' }, { status: 404 });
    }

    if (existingLog.pass_type !== 'walk-in') {
      return NextResponse.json({ error: 'Only walk-in customers can be checked out this way' }, { status: 400 });
    }

    if (existingLog.check_out_time) {
      return NextResponse.json({ error: 'Customer already checked out' }, { status: 400 });
    }

    // Calculate the hours stayed and final amount for walk-in customers
    const checkInTime = new Date(existingLog.check_in_time);
    const checkOutTime = new Date(body.checkOutTime || new Date().toISOString());
    
    // Calculate hours stayed
    const msDiff = checkOutTime.getTime() - checkInTime.getTime();
    const hoursDiff = msDiff / (1000 * 60 * 60);

    // Round according to the specified conditions:
    // Less than 1 hour is considered as 1 hour
    // If minutes are <= 30, round down; if > 30, round up
    let hoursStayed = 1; // Default to 1 hour if less than 1
    if (hoursDiff >= 1) {
      const wholeHours = Math.floor(hoursDiff);
      const remainingMinutes = (hoursDiff - wholeHours) * 60;
      
      if (remainingMinutes <= 30) {
        hoursStayed = wholeHours || 1; // Round down, but minimum 1 hour
      } else {
        hoursStayed = wholeHours + 1; // Round up
      }
    }
    
    // Calculate the final amount based on the membership type and hourly rate
    const hourlyRates: Record<string, Record<string, number>> = {
      student: { 'walk-in': 30 },
      professional: { 'walk-in': 40 }
    };
    
    const hourlyRate = hourlyRates[existingLog.membership_type as string]?.[existingLog.pass_type as string] || 30;
    let totalAmount = hoursStayed * hourlyRate;
    
    // Apply any discount if it was recorded
    if (existingLog.discount_applied) {
      totalAmount = Math.max(totalAmount - existingLog.discount_applied, 0);
    }
    
    // Update the check-in record with the check-out time and calculated amount
    const { data: updatedLog, error: updateError } = await supabase
      .from('customer_logs')
      .update({
        check_out_time: checkOutTime.toISOString(),
        amount_paid: totalAmount,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating check-out time:', updateError);
      return NextResponse.json(
        { 
          error: 'Failed to update check-out time', 
          details: updateError.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        log: updatedLog 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error in walk-in checkout API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { customerRegistrationSchema } from '@/lib/schemas/customer';
import { createClient } from '@/lib/supabase/server';
import { Customer } from '@/lib/types/customer';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();
  const parse = customerRegistrationSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
  }

  // Only allow admins and superadmins
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Insert customer
  const { firstName, lastName, affiliation, email, contactNumber } = parse.data;
  const { error } = await supabase.from('customers').insert({
    first_name: firstName,
    last_name: lastName,
    affiliation,
    email,
    contact_number: contactNumber,
    registered_by: user.id,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

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

    // Verify user has required role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (!profile || !['admin', 'staff', 'superadmin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Fetch all customers
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(customers as Customer[] || []);
  } catch (error) {
    console.error('Unexpected error in customers GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

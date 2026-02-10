import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema for creating a promo code
const createPromoCodeSchema = z.object({
  code: z.string().min(1).max(50),
  discount_type: z.enum(['percentage', 'fixed_amount']),
  discount_value: z.number().min(0),
  is_active: z.boolean().optional().default(true),
  max_uses: z.number().nullable().optional(),
  start_date: z.string().datetime().optional().nullable(),
  end_date: z.string().datetime().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');
    
    let query = supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
    
    if (isActive) {
      query = query.eq('is_active', isActive === 'true');
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching promo codes:', error);
      return NextResponse.json({ error: 'Failed to fetch promo codes', details: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in GET /api/promocodes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate the request body
    const parse = createPromoCodeSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parse.error.flatten() },
        { status: 400 }
      );
    }
    
    const { code, discount_type, discount_value, is_active, max_uses, start_date, end_date } = parse.data;
    
    // Check if promo code already exists
    const { data: existingCode, error: existingCodeError } = await supabase
      .from('promo_codes')
      .select('id')
      .eq('code', code)
      .single();
    
    if (existingCode) {
      return NextResponse.json(
        { error: 'Promo code already exists' },
        { status: 400 }
      );
    }
    
    // Insert the new promo code
    const { data: newPromoCode, error: promoCodeError } = await supabase
      .from('promo_codes')
      .insert({
        code,
        discount_type,
        discount_value,
        is_active,
        max_uses,
        start_date: start_date || null,
        end_date: end_date || null,
      })
      .select()
      .single();
    
    if (promoCodeError) {
      console.error('Error creating promo code:', promoCodeError);
      return NextResponse.json(
        { error: 'Failed to create promo code', details: promoCodeError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(newPromoCode, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/promocodes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Route to validate a promo code
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { code } = body;
    
    if (!code) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
    }
    
    // Fetch the promo code
    const { data: promoCode, error: promoCodeError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .is('is_active', true)
      .single();
    
    if (promoCodeError || !promoCode) {
      return NextResponse.json({ error: 'Invalid or inactive promo code' }, { status: 400 });
    }
    
    // Check if the promo code has expired
    if (promoCode.end_date && new Date() > new Date(promoCode.end_date)) {
      return NextResponse.json({ error: 'Promo code has expired' }, { status: 400 });
    }
    
    // Check if the promo code has started
    if (promoCode.start_date && new Date() < new Date(promoCode.start_date)) {
      return NextResponse.json({ error: 'Promo code is not yet active' }, { status: 400 });
    }
    
    // Check if the promo code has reached its max uses
    if (promoCode.max_uses !== null && promoCode.uses_count >= promoCode.max_uses) {
      return NextResponse.json({ error: 'Promo code has reached maximum uses' }, { status: 400 });
    }
    
    // Return the promo code details
    return NextResponse.json({
      id: promoCode.id,
      code: promoCode.code,
      discount_type: promoCode.discount_type,
      discount_value: promoCode.discount_value,
      is_valid: true
    });
  } catch (error: any) {
    console.error('Error validating promo code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
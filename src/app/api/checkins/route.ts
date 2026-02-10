import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { customerRegistrationSchema } from '@/lib/schemas/customer';
import { createClient } from '@/lib/supabase/server';

// Schema for check-in data
const checkInSchema = z.object({
  passType: z.enum(['walk-in', 'day-pass', 'night-pass', '1-day', 'weekly', 'monthly']),
  membershipType: z.enum(['student', 'professional']),
  amount: z.number(),
  isNewCustomer: z.boolean(),
  customerId: z.string().optional(), // For existing customers
  newCustomerData: customerRegistrationSchema.optional(), // Only required when isNewCustomer is true
  checkInTime: z.string().datetime().optional(), // For walk-in sessions
  checkOutTime: z.string().datetime().optional(), // For walk-in sessions
  promoCode: z.string().optional(), // For promo codes
  discountApplied: z.number().optional(), // For discount amounts
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    console.log('Received request body:', body);

    // Validate the request body
    const parse = checkInSchema.safeParse(body);
    if (!parse.success) {
      console.log('Validation errors:', parse.error.flatten());
      // Format user-friendly error messages
      const fieldErrors = parse.error.flatten().fieldErrors;
      const errorMessages = Object.entries(fieldErrors).map(([field, errors]) => {
        return `${field}: ${errors.join(', ')}`;
      });
      
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: parse.error.flatten(),
          userMessage: errorMessages.length > 0 ? errorMessages.join('; ') : 'Please check your input and try again'
        },
        { status: 400 }
      );
    }

    const {
      passType,
      membershipType,
      amount,
      isNewCustomer,
      newCustomerData
    } = parse.data;

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

    let customerId: string | null = null;

    if (isNewCustomer) {
      // Validate new customer data exists
      if (!newCustomerData) {
        return NextResponse.json(
          { error: 'New customer data is required when creating a new customer' },
          { status: 400 }
        );
      }

      // Validate customer registration data
      const customerParse = customerRegistrationSchema.safeParse(newCustomerData);
      if (!customerParse.success) {
        return NextResponse.json(
          { error: 'Invalid customer data', details: customerParse.error.flatten() },
          { status: 400 }
        );
      }

      // Register new customer
      const { firstName, lastName, affiliation, email, contactNumber } = customerParse.data;
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          first_name: firstName,
          last_name: lastName,
          affiliation,
          email,
          contact_number: contactNumber,
          registered_by: user.id,
        })
        .select('id')
        .single();

      if (customerError) {
        console.error('Error registering customer:', customerError);
        return NextResponse.json(
          { error: 'Failed to register customer', details: customerError.message },
          { status: 500 }
        );
      }

      customerId = newCustomer.id;
    } else {
      // Use existing customer ID from the request body
      customerId = body.customerId;
      if (!customerId) {
        return NextResponse.json(
          { error: 'Customer ID is required for existing customers' },
          { status: 400 }
        );
      }

      // Verify the customer exists
      const { data: existingCustomer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('id', customerId)
        .single();

      if (customerError || !existingCustomer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        );
      }
    }

    // Map the incoming request fields to the correct database column names
    const logEntry = {
      logged_by: user.id,
      check_in_time: body.checkInTime || new Date().toISOString(),
      check_out_time: body.checkOutTime || null,
      log_type: passType,
      membership_type: membershipType,
      pass_type: passType,
      amount_paid: amount,
      // Add customer_id only if it exists
      ...(customerId && { customer_id: customerId }),
      // Add promo code and discount info if provided
      ...(body.promoCode && { promo_code_used: body.promoCode }),
      ...(body.discountApplied && { discount_applied: body.discountApplied })
    };
    
    console.log('Attempting to insert log data:', logEntry);
        
    // Create the check-in log
    const { data: log, error: logError } = await supabase
      .from('customer_logs')
      .insert(logEntry)
      .select('*, customers(first_name, last_name)')
      .single();
    
    if (logError) {
      console.error('Full error object:', logError);
      console.error('Error details - Message:', logError.message);
      console.error('Error details - Code:', logError.code);
      console.error('Error details - Details:', logError.details);
      console.error('Error details - Hint:', logError.hint);
      
      // Provide user-friendly error message based on error type
      let userMessage = 'Failed to create check-in log. Please try again.';
      
      if (logError.code === '23503') { // Foreign key constraint violation
        userMessage = 'Customer not found. Please check the customer information.';
      } else if (logError.code === '23514') { // Check constraint violation
        userMessage = 'Invalid pass type or membership type. Please select valid options.';
      } else if (logError.message.includes('customer_logs')) {
        userMessage = 'Unable to save check-in. Please verify all required fields are filled correctly.';
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to create check-in log', 
          details: logError.message,
          code: logError.code,
          userMessage
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        log,
        customerId,
        isNewCustomer
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Unexpected error in check-in API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
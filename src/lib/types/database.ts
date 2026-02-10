export type UserRole = 'superadmin' | 'admin' | 'staff' | 'member';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export type MembershipType = 'professional' | 'student';
export type PassType = 'walk-in' | 'day-pass' | 'night-pass' | '1-day' | 'weekly' | 'monthly';

export interface MembershipRate {
  pass_type: PassType;
  membership_type: MembershipType;
  price: number;
}

export interface Member extends UserProfile {
  membership_type?: MembershipType;
  active_pass_type?: PassType;
  check_in_code: string;
  membership_start_date?: string;
  membership_end_date?: string;
  is_active: boolean;
}

export interface CustomerLog {
  id: string;
  customer_id?: string;
  member_id?: string;
  logged_by: string;
  check_in_time: string;
  check_out_time?: string;
  log_type: 'walk-in' | 'member';
  membership_type?: MembershipType;
  pass_type?: PassType;
  amount_paid?: number;
  notes?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  product_id: string;
  quantity: number;
  total_price: number;
  sold_by: string;
  member_id?: string;
  is_walk_in: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  created_by: string;
  recorded_date: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Promo {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

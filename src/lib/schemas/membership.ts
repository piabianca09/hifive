import { z } from 'zod';

export const MembershipSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  membershipType: z.enum(['student', 'professional']),
  passType: z.enum(['walk-in', 'day-pass', 'night-pass', '1-day', 'weekly', 'monthly']),
});

export const ExpenseSchema = z.object({
  description: z.string().min(3, 'Description must be at least 3 characters'),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  recordedDate: z.date(),
});

export const ProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().positive('Quantity must be positive'),
});

export const SaleSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be positive'),
  memberId: z.string().uuid().optional(),
  isWalkIn: z.boolean(),
});

export type MembershipInput = z.infer<typeof MembershipSchema>;
export type ExpenseInput = z.infer<typeof ExpenseSchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
export type SaleInput = z.infer<typeof SaleSchema>;

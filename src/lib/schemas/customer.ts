import { z } from 'zod';

export const customerRegistrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  affiliation: z.string().min(1, 'School or affiliation is required'),
  email: z.string().email('Invalid email address'),
  contactNumber: z.string().min(3, 'Contact number must be at least 3 characters'),
});

export type CustomerRegistrationInput = z.infer<typeof customerRegistrationSchema>;

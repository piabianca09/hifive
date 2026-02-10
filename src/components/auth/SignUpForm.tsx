'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { SignUpSchema } from '@/lib/schemas/auth';

type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  membershipType?: string;
};

export default function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    membershipType: '' as 'student' | 'professional' | '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
        <h3 className="font-bold mb-2">Supabase Not Configured</h3>
        <p className="text-sm mb-2">Please update your <code className="bg-yellow-100 px-1">.env.local</code> file with valid Supabase credentials:</p>
        <pre className="text-xs bg-yellow-100 p-2 rounded overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
        </pre>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    try {
      const parsed = SignUpSchema.parse(formData);
      const supabase = await createClient();

      const { data, error: authError } = await supabase.auth.signUp({
        email: parsed.email,
        password: parsed.password,
        options: {
          data: {
            full_name: parsed.fullName,
            membership_type: parsed.membershipType,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase.from('user_profiles').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: parsed.fullName,
          role: 'member',
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't block sign-up if profile creation fails - it can be created later
        }

        router.push('/auth/sign-in?message=Check your email to confirm your account');
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      if (err.errors) {
        // Parse Zod validation errors into field-specific errors
        const errors: FieldErrors = {};
        err.errors.forEach((e: any) => {
          const field = e.path[0] as keyof FieldErrors;
          if (field) {
            errors[field] = e.message;
          }
        });
        setFieldErrors(errors);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            fieldErrors.fullName ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {fieldErrors.fullName && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.fullName}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            fieldErrors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="membershipType" className="block text-sm font-medium text-gray-700">
          Membership Type
        </label>
        <select
          id="membershipType"
          value={formData.membershipType}
          onChange={(e) =>
            setFormData({ ...formData, membershipType: e.target.value as 'student' | 'professional' | '' })
          }
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            fieldErrors.membershipType ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select membership type</option>
          <option value="student">Student</option>
          <option value="professional">Professional</option>
        </select>
        {fieldErrors.membershipType && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.membershipType}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            fieldErrors.password ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {fieldErrors.password ? (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {fieldErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition"
      >
        {isLoading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );
}

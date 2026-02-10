import { useState } from 'react';
import { customerRegistrationSchema, CustomerRegistrationInput } from '@/lib/schemas/customer';
import { useAuthStore } from '@/store/authStore';

export default function RegisterCustomerModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: (customer: any) => void }) {
  const [form, setForm] = useState<CustomerRegistrationInput>({
    firstName: '',
    lastName: '',
    affiliation: '',
    email: '',
    contactNumber: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userRole } = useAuthStore();

  if (!open) return null;
  if (!userRole || !['admin', 'superadmin'].includes(userRole)) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const parsed = customerRegistrationSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Invalid input');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setForm({ firstName: '', lastName: '', affiliation: '', email: '', contactNumber: '' });
      // Fetch the newly created customer (assume API returns success only)
      // For best UX, optimistically add the customer using form data
      onSuccess({
        id: Date.now().toString(), // Temporary ID for UI
        first_name: form.firstName,
        last_name: form.lastName,
        affiliation: form.affiliation,
        email: form.email,
        contact_number: form.contactNumber,
        created_at: new Date().toISOString(),
      });
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to register customer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: '#f9f2f7' }}>
      <div className="bg-accent rounded-lg shadow-lg p-8 w-full max-w-md border-2 border-primary">
        <h2 className="text-xl font-bold mb-4 text-primary">Register New Customer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" className="w-full border border-primary rounded px-3 py-2 bg-background text-primary" />
          <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" className="w-full border border-primary rounded px-3 py-2 bg-background text-primary" />
          <input name="affiliation" value={form.affiliation} onChange={handleChange} placeholder="School/Affiliation" className="w-full border border-primary rounded px-3 py-2 bg-background text-primary" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email Address" className="w-full border border-primary rounded px-3 py-2 bg-background text-primary" />
          <input name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="Contact Number" className="w-full border border-primary rounded px-3 py-2 bg-background text-primary" />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">Customer registered!</div>}
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-background text-primary border border-primary">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-primary text-accent border border-primary">{loading ? 'Registering...' : 'Register'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

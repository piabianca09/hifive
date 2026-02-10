// src/components/dashboard/LogCustomerModal.tsx
'use client';
import { useState, useEffect } from 'react';


type MembershipType = 'student' | 'professional';
type PassType = 'walk-in' | 'day-pass' | 'night-pass' | '1-day' | 'weekly' | 'monthly';
interface LogCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onLog: (data: LogData) => void;
  customer: any;
}
interface LogData {
  customer: any;
  passType: PassType;
  membershipType: MembershipType;
  checkInTime: Date | null;
  checkOutTime: Date | null;
  amount: number;
}


function LogCustomerModal({ open, onClose, onLog, customer }: LogCustomerModalProps) {
  const RATES: Record<PassType, Record<MembershipType, number>> = {
    'walk-in': { student: 30, professional: 40 },
    'day-pass': { student: 200, professional: 250 },
    'night-pass': { student: 150, professional: 200 },
    '1-day': { student: 300, professional: 400 },
    'weekly': { student: 1000, professional: 1200 },
    'monthly': { student: 2500, professional: 3500 },
  };

  const [passType, setPassType] = useState<PassType>('walk-in');
  const [membershipType, setMembershipType] = useState<MembershipType>('student');
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [amount, setAmount] = useState(0);
  const [isWalkInActive, setIsWalkInActive] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(customer);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);

  // Fetch customers if customer prop is null (for check-in page)
  useEffect(() => {
    if (customer === null && open) {
      setCustomerLoading(true);
      setCustomerError(null);
      fetch('/api/customers')
        .then((res) => res.json())
        .then((data) => {
          setCustomers(Array.isArray(data) ? data : []);
          setCustomerLoading(false);
        })
        .catch(() => {
          setCustomerError('Failed to load customers');
          setCustomerLoading(false);
        });
    }
    if (customer !== null) {
      setSelectedCustomer(customer);
    }
  }, [customer, open]);

  if (!open) return null;

  const handleStartWalkIn = (): void => {
    setCheckInTime(new Date());
    setIsWalkInActive(true);
  };

  const handleCheckoutWalkIn = (): void => {
    const out = new Date();
    setCheckOutTime(out);
    if (checkInTime) {
      const hours = Math.ceil((out.getTime() - checkInTime.getTime()) / (1000 * 60 * 60));
      setAmount(hours * RATES['walk-in'][membershipType]);
    }
    setIsWalkInActive(false);
  };

  const handlePassChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value as PassType;
    setPassType(value);
    if (value !== 'walk-in') {
      setAmount(RATES[value][membershipType]);
    } else {
      setAmount(0);
    }
  };

  const handleMembershipChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value as MembershipType;
    setMembershipType(value);
    if (passType !== 'walk-in') {
      setAmount(RATES[passType][value]);
    }
  };

  const handleLog = (): void => {
    if (!selectedCustomer) return;
    onLog({
      customer: selectedCustomer,
      passType,
      membershipType,
      checkInTime,
      checkOutTime,
      amount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Log Customer Check-in</h2>
        <div className="space-y-4">
          {customer === null && (
            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              {customerLoading ? (
                <div>Loading customers...</div>
              ) : customerError ? (
                <div className="text-red-600">{customerError}</div>
              ) : (
                <select
                  value={selectedCustomer ? selectedCustomer.id : ''}
                  onChange={e => {
                    const found = customers.find(c => c.id === e.target.value);
                    setSelectedCustomer(found || null);
                  }}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Pass Type</label>
            <select value={passType} onChange={handlePassChange} className="w-full border rounded px-3 py-2">
              <option value="walk-in">Walk-in</option>
              <option value="day-pass">Day-pass</option>
              <option value="night-pass">Night-pass</option>
              <option value="1-day">1-day</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Membership Type</label>
            <select value={membershipType} onChange={handleMembershipChange} className="w-full border rounded px-3 py-2">
              <option value="student">Student</option>
              <option value="professional">Professional</option>
            </select>
          </div>
          {passType === 'walk-in' ? (
            <div>
              <div className="mb-2">Hourly Rate: ₱{RATES['walk-in'][membershipType]}</div>
              {isWalkInActive ? (
                <button onClick={handleCheckoutWalkIn} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2 transition-colors duration-200">Checkout</button>
              ) : (
                <button onClick={handleStartWalkIn} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2 transition-colors duration-200">Start</button>
              )}
              {amount > 0 && <div className="mt-2">Total: ₱{amount}</div>}
            </div>
          ) : (
            <div className="mb-2">Amount to Pay: <span className="font-bold">₱{amount}</span></div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
            <button
              onClick={handleLog}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={customer === null && !selectedCustomer}
            >
              Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogCustomerModal;

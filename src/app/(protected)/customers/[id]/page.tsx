'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isPassValid } from '@/lib/utils/timeUtils';
import { useAuth } from '@/hooks/useAuth';
import ComingSoon from '@/components/common/ComingSoon';

export default function CustomerProfile() {
  const { id } = useParams();
  const { user, userRole } = useAuth();
  const [customer, setCustomer] = useState<any>(null);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        // Get customer details
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', id)
          .single();

        if (customerError) throw customerError;

        // Get customer check-in history
        const { data: checkinData, error: checkinError } = await supabase
          .from('customer_logs')
          .select('*, users(email)')
          .eq('customer_id', id)
          .order('check_in_time', { ascending: false });

        if (checkinError) throw checkinError;

        setCustomer(customerData);
        setCheckins(checkinData || []);
      } catch (err: any) {
        console.error('Error fetching customer data:', err);
        setError(err.message || 'Failed to fetch customer data');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id]);

  if (userRole !== 'admin' && userRole !== 'staff') {
    return <ComingSoon />;
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12 text-[#03034b]">
          <p className="text-lg">Loading customer profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12 text-red-600">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12 text-[#03034b]">
          <p>Customer not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-lg border border-[#1827a0] border-opacity-30 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-[#1827a0] to-[#0c5ee5] p-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-[#0c5ee5] to-[#1827a0] border-2 border-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold text-white">
              {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-white">{customer.first_name} {customer.last_name}</h1>
              <p className="text-[#e8e4d5]">{customer.affiliation}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#f9f2f7] p-4 rounded-lg border border-[#e8e4d5]">
              <h2 className="text-lg font-semibold text-[#03034b] mb-2">Contact Information</h2>
              <p className="text-[#03034b]"><span className="font-medium">Email:</span> {customer.email}</p>
              <p className="text-[#03034b]"><span className="font-medium">Phone:</span> {customer.contact_number}</p>
            </div>
            
            <div className="bg-[#f9f2f7] p-4 rounded-lg border border-[#e8e4d5]">
              <h2 className="text-lg font-semibold text-[#03034b] mb-2">Registration Details</h2>
              <p className="text-[#03034b]"><span className="font-medium">Registered:</span> {new Date(customer.created_at).toLocaleDateString()}</p>
              <p className="text-[#03034b]"><span className="font-medium">Registered By:</span> {customer.registered_by}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-[#03034b] mb-4">Check-in History</h2>
            
            {checkins.length === 0 ? (
              <div className="text-center py-8 text-[#03034b]">
                <p>No check-in history found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-white border border-[#e8e4d5] rounded-lg">
                  <thead className="bg-[#1827a0] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Date & Time</th>
                      <th className="px-4 py-3 text-left">Pass Type</th>
                      <th className="px-4 py-3 text-left">Membership</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Logged By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkins.map((checkin) => (
                      <tr key={checkin.id} className="border-b border-[#e8e4d5] hover:bg-[#f9f2f7] transition-colors duration-150">
                        <td className="px-4 py-3 text-[#03034b]">
                          <div>{new Date(checkin.check_in_time).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-600">{new Date(checkin.check_in_time).toLocaleTimeString()}</div>
                        </td>
                        <td className="px-4 py-3 text-[#03034b]">{checkin.pass_type}</td>
                        <td className="px-4 py-3 text-[#03034b]">{checkin.membership_type}</td>
                        <td className="px-4 py-3 text-[#03034b]">₱{checkin.amount_paid}</td>
                        <td className="px-4 py-3 text-[#03034b]">
                          {checkin.pass_type === 'walk-in' ? 
                            (checkin.check_out_time ? 'Checked Out' : 'Active') : 
                            (isPassValid(checkin.pass_type, checkin.check_in_time) ? 'Active' : 'Expired')
                          }
                        </td>
                        <td className="px-4 py-3 text-[#03034b]">{checkin.users?.email || 'Unknown'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
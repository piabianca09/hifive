"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import CheckInCustomerModal from '@/components/dashboard/CheckInCustomerModal';
import { isPassValid } from '@/lib/utils/timeUtils';
import FilterSortHeader from '@/components/common/FilterSortHeader';

export default function CheckinsPage() {
  const [checkins, setCheckins] = useState<any[]>([]);
  const [activeCustomers, setActiveCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [refresh, setRefresh] = useState(0);
  
  // Search and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('check_in_time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    async function fetchCheckins() {
      setLoading(true);
      const supabase = createClient();
      
      // Fetch all customer logs (both checked-in and checked-out)
      const { data, error } = await supabase
        .from('customer_logs')
        .select('*, customers(first_name, last_name)')
        .order('check_in_time', { ascending: false });
      
      if (data) {
        // Filter for active customers based on pass validity
        const activeCusts = data.filter(log => {
          // For walk-in customers, they're active if they haven't checked out yet
          if (log.pass_type === 'walk-in') {
            return !log.check_out_time;
          }
          // For other pass types, check if the pass is still valid
          else {
            return isPassValid(log.pass_type, log.check_in_time);
          }
        });
        
        setActiveCustomers(activeCusts);
        setCheckins(data);
      }
      
      setLoading(false);
    }
    fetchCheckins();
  }, [refresh]);

  // Apply search, sort, and filter to active customers
  useEffect(() => {
    let result = [...activeCustomers];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(customer => 
        (customer.customers?.first_name?.toLowerCase().includes(term) ||
         customer.customers?.last_name?.toLowerCase().includes(term) ||
         `${customer.customers?.first_name} ${customer.customers?.last_name}`.toLowerCase().includes(term) ||
         customer.pass_type?.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      
      // Handle nested properties (e.g., customers.first_name)
      if (sortField.startsWith('customers.')) {
        const nestedField = sortField.split('.')[1];
        valA = a.customers?.[nestedField];
        valB = b.customers?.[nestedField];
      } else {
        valA = a[sortField];
        valB = b[sortField];
      }
      
      // Convert dates to timestamps for comparison
      if (sortField.includes('_time') && valA && valB) {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      
      if (sortOrder === 'asc') {
        return valA < valB ? -1 : valA > valB ? 1 : 0;
      } else {
        return valA > valB ? -1 : valA < valB ? 1 : 0;
      }
    });
    
    setFilteredCustomers(result);
  }, [activeCustomers, searchTerm, sortField, sortOrder]);
  
  const handleWalkInCheckout = async (log: any) => {
    if (!confirm('Are you sure you want to checkout this walk-in customer?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/checkins/${log.id}/checkout`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkOutTime: new Date().toISOString(),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.userMessage || data.error || 'Failed to checkout customer');
      }
      
      // Refresh the data
      setRefresh((r) => r + 1);
    } catch (error: any) {
      console.error('Error checking out walk-in customer:', error);
      alert(error.message || 'An error occurred while checking out the customer');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-[#03034b]">Current Check-Ins</h1>
      <button
        className="bg-[#1827a0] text-white px-4 py-2 rounded mb-4 hover:bg-[#0c5ee5] border border-[#03034b] shadow-md"
        onClick={() => setShowLogModal(true)}
      >
        Check In Customer
      </button>
      
      <FilterSortHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={(field) => {
          if (field === sortField) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          } else {
            setSortField(field);
            setSortOrder('desc');
          }
        }}
        placeholder="Search customers or pass types..."
        className="mb-4"
      />
      
      {loading && (
        <div className="text-center py-4 text-[#03034b] font-medium">Loading check-ins...</div>
      )}
      {loading ? (
        <div className="text-[#03034b] font-medium">Loading...</div>
      ) : (
        <table className="min-w-full bg-[#f9f2f7] border border-[#1827a0] rounded-lg overflow-hidden shadow-md">
          <thead>
            <tr className="bg-[#1827a0] text-white">
              <th className="px-4 py-3 border-b border-[#0c5ee5] text-left text-[#f9f2f7] font-semibold">Name</th>
              <th className="px-4 py-3 border-b border-[#0c5ee5] text-left text-[#f9f2f7] font-semibold">Pass Type</th>
              <th className="px-4 py-3 border-b border-[#0c5ee5] text-left text-[#f9f2f7] font-semibold">Check-In Time</th>
              <th className="px-4 py-3 border-b border-[#0c5ee5] text-left text-[#f9f2f7] font-semibold">Status</th>
              <th className="px-4 py-3 border-b border-[#0c5ee5] text-left text-[#f9f2f7] font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-[#e8e4d5] transition-colors duration-150">
                <td className="px-4 py-3 border-b border-[#e8e4d5] text-[#03034b]">
                  {c.customers ? (
                    <Link href={`/customers/${c.customers.id}`} className="text-[#1827a0] hover:text-[#0c5ee5] underline">
                      {c.customers.first_name} {c.customers.last_name}
                    </Link>
                  ) : 'Unknown'}
                </td>
                <td className="px-4 py-3 border-b border-[#e8e4d5] text-[#03034b]">{c.pass_type}</td>
                <td className="px-4 py-3 border-b border-[#e8e4d5] text-[#03034b]">{c.check_in_time ? new Date(c.check_in_time).toLocaleString() : ''}</td>
                <td className="px-4 py-3 border-b border-[#e8e4d5] text-[#03034b]">
                  {c.pass_type === 'walk-in' ? 
                    (c.check_out_time ? 'Checked Out' : 'Active') : 
                    (isPassValid(c.pass_type, c.check_in_time) ? 'Active' : 'Expired')
                  }
                </td>
                <td className="px-4 py-3 border-b border-[#e8e4d5] text-[#03034b]">
                  {c.pass_type === 'walk-in' && !c.check_out_time && (
                    <button 
                      onClick={() => handleWalkInCheckout(c)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors duration-150 text-sm"
                    >
                      Checkout
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showLogModal && (
        <CheckInCustomerModal
          open={showLogModal}
          onClose={() => {
            setShowLogModal(false);
            setRefresh((r) => r + 1); // Refresh to update the active customer list
          }}
          onCheckIn={() => { setShowLogModal(false); setRefresh((r) => r + 1); }}
        />
      )}
    </div>
  );
}
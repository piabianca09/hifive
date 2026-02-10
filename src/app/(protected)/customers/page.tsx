"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import FilterSortHeader from '@/components/common/FilterSortHeader';
import { Eye, Pencil, Trash2 } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true);
        const response = await fetch('/api/customers');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch customers');
        }
        
        const data = await response.json();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching customers');
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  // Apply search, sort, and filter
  useEffect(() => {
    let result = [...customers];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(customer => 
        (customer.first_name?.toLowerCase().includes(term) ||
         customer.last_name?.toLowerCase().includes(term) ||
         `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(term) ||
         customer.affiliation?.toLowerCase().includes(term) ||
         customer.email?.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      
      // Convert dates to timestamps for comparison
      if (sortField.includes('_at') && valA && valB) {
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
  }, [customers, searchTerm, sortField, sortOrder]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-[#03034b]">Customers</h1>
        <div className="text-center py-8 text-[#03034b]">Loading customers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-[#03034b]">Customers</h1>
        <div className="text-center py-8 text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-[#03034b]">Customers</h1>
      
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
        placeholder="Search customers..."
        className="mb-4"
      />
      
      <div className="bg-white rounded-lg shadow-md border border-[#1827a0]">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 text-[#03034b]">
            <p className="text-lg">No customers found.</p>
            <p className="text-gray-600 mt-2">Try changing your search or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-hidden">
            <table className="w-full divide-y divide-[#e8e4d5]">
              <thead className="bg-[#1827a0] text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Affiliation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#e8e4d5]">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#f9f2f7] transition-colors duration-150">
                    <td className="px-4 py-3 text-sm text-[#03034b]">
                        {customer.first_name} {customer.last_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#03034b] truncate max-w-[120px]" title={customer.affiliation}>
                      {customer.affiliation}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#03034b] truncate max-w-[150px]" title={customer.email}>
                      {customer.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#03034b]">
                      {customer.contact_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#03034b]">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Link
                        href={`/customers/${customer.id}`}
                        className="inline-flex items-center justify-center rounded bg-[#1827a0] p-2 text-white hover:bg-[#0c5ee5]"
                        aria-label="View customer"
                        title="View"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        href={`/customers/${customer.id}`}
                        className="inline-flex items-center justify-center rounded bg-[#1827a0] p-2 text-white hover:bg-[#0c5ee5]"
                        aria-label="Edit customer"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </Link>
                      <Link
                        href={`/customers/${customer.id}`}
                        className="inline-flex items-center justify-center rounded bg-[#1827a0] p-2 text-white hover:bg-[#0c5ee5]"
                        aria-label="Delete customer"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-sm text-[#03034b]">
        <p>Showing {filteredCustomers.length} of {customers.length} customers</p>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import RegisterCustomerModal from './RegisterCustomerModal';
import { useEffect, useState as useReactState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboard() {
  // Top customers state
  const [topCustomers, setTopCustomers] = useReactState<any[]>([]);
  const [loadingTop, setLoadingTop] = useReactState(false);
  const [topError, setTopError] = useReactState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'sales' | 'expenses' | 'members'>('overview');

  useEffect(() => {
    if (activeTab !== 'customers') return;
    setLoadingTop(true);
    setTopError(null);
    fetch('/api/logs?top=true')
      .then((res) => res.json())
      .then((data) => {
        setTopCustomers(data);
        setLoadingTop(false);
      })
      .catch((err) => {
        setTopError('Failed to load top customers');
        setLoadingTop(false);
      });
  }, [activeTab]);
  
  // Fetch metrics when dashboard loads
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoadingMetrics(true);
        
        // Fetch all metrics in parallel
        const [membersRes, revenueRes, checkinsRes, expensesRes] = await Promise.all([
          fetch('/api/members'),
          fetch('/api/expenses/today'),
          fetch('/api/checkins/active'),
          fetch('/api/expenses/pending')
        ]);
        
        const [membersData, revenueData, checkinsData, expensesData] = await Promise.all([
          membersRes.json(),
          revenueRes.json(),
          checkinsRes.json(),
          expensesRes.json()
        ]);
        
        setMetrics({
          totalMembers: membersData.count || 0,
          todayRevenue: revenueData.total || 0,
          activeCheckins: checkinsData.count || 0,
          pendingExpenses: expensesData.count || 0
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
        // Set default values on error
        setMetrics({
          totalMembers: 0,
          todayRevenue: 0,
          activeCheckins: 0,
          pendingExpenses: 0
        });
      } finally {
        setLoadingMetrics(false);
      }
    };
    
    fetchMetrics();
  }, []);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { userRole } = useAuthStore();

  // Customer list state
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);
  
  // Metrics state
  const [metrics, setMetrics] = useState({
    totalMembers: 0,
    todayRevenue: 0,
    activeCheckins: 0,
    pendingExpenses: 0
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Fetch customers when tab is 'customers' and modal closes
  // Fetch customers when tab is 'customers' and modal closes
  useEffect(() => {
    if (activeTab !== 'customers' || showRegisterModal) return;
    fetchCustomers();
  }, [activeTab, showRegisterModal]);

  // Fetch customers helper
  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    setCustomerError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      setCustomers(data || []);
    } catch (err: any) {
      setCustomerError(err.message || 'Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Add new customer to list immediately after registration
  const handleCustomerRegistered = (newCustomer: any) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    setShowRegisterModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#f9f2f7] to-[#e8e4d5] min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#03034b] text-center">Admin Dashboard</h1>
        <p className="text-[#03034b] text-center mt-2">Manage your co-working business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-white to-[#f0ebe1] rounded-xl shadow-lg p-6 border border-[#1827a0] border-opacity-30 transition-transform duration-300 hover:scale-[1.02]">
          <h3 className="text-[#03034b] text-base font-medium">Total Members</h3>
          {loadingMetrics ? (
            <p className="text-3xl font-bold text-[#1827a0] mt-2 animate-pulse">...</p>
          ) : (
            <p className="text-3xl font-bold text-[#1827a0] mt-2">{metrics.totalMembers}</p>
          )}
        </div>
        <div className="bg-gradient-to-br from-white to-[#f0ebe1] rounded-xl shadow-lg p-6 border border-[#1827a0] border-opacity-30 transition-transform duration-300 hover:scale-[1.02]">
          <h3 className="text-[#03034b] text-base font-medium">Today's Revenue</h3>
          {loadingMetrics ? (
            <p className="text-3xl font-bold text-[#1827a0] mt-2 animate-pulse">₱...</p>
          ) : (
            <p className="text-3xl font-bold text-[#1827a0] mt-2">₱{metrics.todayRevenue.toFixed(2)}</p>
          )}
        </div>
        <div className="bg-gradient-to-br from-white to-[#f0ebe1] rounded-xl shadow-lg p-6 border border-[#1827a0] border-opacity-30 transition-transform duration-300 hover:scale-[1.02]">
          <h3 className="text-[#03034b] text-base font-medium">Active Check-ins</h3>
          {loadingMetrics ? (
            <p className="text-3xl font-bold text-[#1827a0] mt-2 animate-pulse">...</p>
          ) : (
            <p className="text-3xl font-bold text-[#1827a0] mt-2">{metrics.activeCheckins}</p>
          )}
        </div>
        <div className="bg-gradient-to-br from-white to-[#f0ebe1] rounded-xl shadow-lg p-6 border border-[#1827a0] border-opacity-30 transition-transform duration-300 hover:scale-[1.02]">
          <h3 className="text-[#03034b] text-base font-medium">Pending Expenses</h3>
          {loadingMetrics ? (
            <p className="text-3xl font-bold text-[#1827a0] mt-2 animate-pulse">...</p>
          ) : (
            <p className="text-3xl font-bold text-[#1827a0] mt-2">{metrics.pendingExpenses}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gradient-to-br from-white to-[#f0ebe1] rounded-xl shadow-lg border border-[#1827a0] border-opacity-30">
        <div className="border-b border-[#1827a0] border-opacity-30">
          <div className="flex">
            {(['overview', 'customers', 'sales', 'expenses', 'members'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 text-center font-medium capitalize rounded-t-lg transition-colors duration-200 ${
                  activeTab === tab
                    ? 'text-white bg-gradient-to-r from-[#1827a0] to-[#0c5ee5] shadow-inner'
                    : 'text-[#03034b] hover:text-[#1827a0] hover:bg-[#f0ebe1]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-[#03034b]">Overview</h2>
              <p className="text-[#03034b]">Dashboard analytics and overview coming soon</p>
            </div>
          )}

          {activeTab === 'customers' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#03034b]">Customer List</h2>
                {(userRole === 'admin' || userRole === 'superadmin') && (
                  <button
                    className="bg-gradient-to-r from-[#1827a0] to-[#0c5ee5] text-white px-4 py-2.5 rounded-lg shadow-md hover:from-[#0c5ee5] hover:to-[#0a4ec0] transition-all duration-200"
                    onClick={() => setShowRegisterModal(true)}
                  >
                    Register Customer
                  </button>
                )}
              </div>
              <RegisterCustomerModal
                open={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSuccess={handleCustomerRegistered}
              />
              {loadingCustomers ? (
                <div className="text-[#03034b]">Loading customers...</div>
              ) : customerError ? (
                <div className="text-red-600">{customerError}</div>
              ) : customers.length === 0 ? (
                <div className="text-[#03034b]">No customers found.</div>
              ) : (
                <>
                  <div className="overflow-x-auto mt-4 rounded-lg border border-[#1827a0] border-opacity-30">
                    <table className="min-w-full bg-white border border-[#1827a0] border-opacity-30 rounded-lg overflow-hidden">
                      <thead className="bg-gradient-to-r from-[#1827a0] to-[#0c5ee5] text-white">
                        <tr>
                          <th className="px-4 py-3 border-b border-[#e8e4d5] text-left text-sm font-semibold">Name</th>
                          <th className="px-4 py-3 border-b border-[#e8e4d5] text-left text-sm font-semibold">Affiliation</th>
                          <th className="px-4 py-3 border-b border-[#e8e4d5] text-left text-sm font-semibold">Email</th>
                          <th className="px-4 py-3 border-b border-[#e8e4d5] text-left text-sm font-semibold">Contact</th>
                          <th className="px-4 py-3 border-b border-[#e8e4d5] text-left text-sm font-semibold">Registered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((c) => (
                          <tr key={c.id} className="hover:bg-[#f9f2f7] transition-colors duration-150">
                            <td className="px-4 py-3 border-b border-[#e8e4d5] text-[#03034b]">{c.first_name} {c.last_name}</td>
                            <td className="px-4 py-3 border-b border-[#e8e4d5] text-[#03034b]">{c.affiliation || '-'}</td>
                            <td className="px-4 py-3 border-b border-[#e8e4d5] text-[#03034b]">{c.email || '-'}</td>
                            <td className="px-4 py-3 border-b border-[#e8e4d5] text-[#03034b]">{c.contact_number || '-'}</td>
                            <td className="px-4 py-3 border-b border-[#e8e4d5] text-[#03034b]">{c.created_at ? new Date(c.created_at).toLocaleString() : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-[#03034b] mb-2">Top Customers</h3>
                    {loadingTop ? (
                      <div className="text-[#03034b]">Loading top customers...</div>
                    ) : topError ? (
                      <div className="text-red-600">{topError}</div>
                    ) : (
                      <div className="rounded-lg border border-[#1827a0] border-opacity-30 overflow-hidden">
                        <table className="min-w-full bg-white border border-[#1827a0] border-opacity-30 rounded-lg overflow-hidden">
                          <thead className="bg-gradient-to-r from-[#1827a0] to-[#0c5ee5] text-white">
                            <tr>
                              <th className="px-4 py-3 border-b border-[#e8e4d5] text-left text-sm font-semibold">Name</th>
                              <th className="px-4 py-3 border-b border-[#e8e4d5] text-left text-sm font-semibold">Total Logs/Passes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(Array.isArray(topCustomers) ? topCustomers : []).map((c) => (
                              <tr key={c.customer_id} className="hover:bg-[#f9f2f7] transition-colors duration-150">
                                <td className="px-4 py-3 border-b border-[#e8e4d5] text-[#03034b]">{c.name}</td>
                                <td className="px-4 py-3 border-b border-[#e8e4d5] text-[#03034b]">{c.count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'sales' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-[#03034b]">Sales</h2>
              <p className="text-[#03034b]">View and manage product sales</p>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-[#03034b]">Expenses</h2>
              <p className="text-[#03034b]">Review and approve staff expense submissions</p>
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-[#03034b]">Members</h2>
              <p className="text-[#03034b]">Manage members, memberships and promos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
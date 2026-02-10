'use client';

import { useState, useEffect } from 'react';
import CheckInCustomerModal from './CheckInCustomerModal';

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState<'log-customer' | 'expenses' | 'shift-balance'>('log-customer');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [refreshCheckins, setRefreshCheckins] = useState(0);
  
  // Metrics state
  const [metrics, setMetrics] = useState({
    checkinsToday: 0,
    shiftRevenue: 0,
    shiftExpenses: 0
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);



  // Fetch metrics when dashboard loads or when check-ins are refreshed
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoadingMetrics(true);
        
        // Fetch all metrics in parallel
        const [checkinsRes, revenueRes, expensesRes] = await Promise.all([
          fetch('/api/checkins/today'),
          fetch('/api/expenses/today'),
          fetch('/api/expenses/staff')
        ]);
        
        const [checkinsData, revenueData, expensesData] = await Promise.all([
          checkinsRes.json(),
          revenueRes.json(),
          expensesRes.json()
        ]);
        
        setMetrics({
          checkinsToday: checkinsData.count || 0,
          shiftRevenue: revenueData.total || 0,
          shiftExpenses: expensesData.total || 0
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
        // Set default values on error
        setMetrics({
          checkinsToday: 0,
          shiftRevenue: 0,
          shiftExpenses: 0
        });
      } finally {
        setLoadingMetrics(false);
      }
    };
    
    fetchMetrics();
  }, [refreshCheckins]);



  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-600 mt-2">Log customers, record expenses, and manage your shift</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-600 text-sm font-medium">Check-ins Today</h3>
          {loadingMetrics ? (
            <p className="text-3xl font-bold text-blue-600 mt-2 animate-pulse">...</p>
          ) : (
            <p className="text-3xl font-bold text-blue-600 mt-2">{metrics.checkinsToday}</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-gray-600 text-sm font-medium">Shift Revenue</h3>
          {loadingMetrics ? (
            <p className="text-3xl font-bold text-green-600 mt-2 animate-pulse">₱...</p>
          ) : (
            <p className="text-3xl font-bold text-green-600 mt-2">₱{metrics.shiftRevenue.toFixed(2)}</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <h3 className="text-gray-600 text-sm font-medium">Shift Expenses</h3>
          {loadingMetrics ? (
            <p className="text-3xl font-bold text-red-600 mt-2 animate-pulse">₱...</p>
          ) : (
            <p className="text-3xl font-bold text-red-600 mt-2">₱{metrics.shiftExpenses.toFixed(2)}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            {(['log-customer', 'expenses', 'shift-balance'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'log-customer' && 'Log Customer'}
                {tab === 'expenses' && 'Record Expense'}
                {tab === 'shift-balance' && 'Shift Balance'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'log-customer' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Log Customer Check-in</h2>
                <div className="mb-4">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-200"
                    onClick={() => setShowCheckInModal(true)}
                  >
                    Check In Customer
                  </button>
                </div>
                <CheckInCustomerModal
                  open={showCheckInModal}
                  onClose={() => {
                    setShowCheckInModal(false);
                    setRefreshCheckins(prev => prev + 1); // Refresh metrics after check-in
                  }}
                  onCheckIn={() => {
                    setShowCheckInModal(false);
                    setRefreshCheckins(prev => prev + 1); // Refresh metrics after check-in
                  }}
                />
              </div>
          )}

          {activeTab === 'expenses' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Record Expense</h2>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const description = formData.get('description') as string;
                const amount = parseFloat(formData.get('amount') as string);
                
                if (description && amount > 0) {
                  // In a real implementation, you'd submit to an API
                  alert(`Expense recorded: ${description} - ₱${amount.toFixed(2)}`);
                  (e.target as HTMLFormElement).reset();
                } else {
                  alert('Please fill in all fields with valid values');
                }
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    name="description"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Expense description"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    min="0.01"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  Submit Expense
                </button>
              </form>
            </div>
          )}

          {activeTab === 'shift-balance' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Shift Balance</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded border-l-4 border-green-500">
                  <p className="text-gray-600">Check-in Revenue: 
                    {loadingMetrics ? (
                      <span className="text-lg font-bold text-green-600 animate-pulse">₱...</span>
                    ) : (
                      <span className="text-lg font-bold text-green-600">₱{metrics.shiftRevenue.toFixed(2)}</span>
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded border-l-4 border-green-500">
                  <p className="text-gray-600">Sales Revenue: <span className="text-lg font-bold text-green-600">₱0.00</span></p>
                </div>
                <div className="bg-gray-50 p-4 rounded border-l-4 border-red-500">
                  <p className="text-gray-600">Total Expenses: 
                    {loadingMetrics ? (
                      <span className="text-lg font-bold text-red-600 animate-pulse">₱...</span>
                    ) : (
                      <span className="text-lg font-bold text-red-600">₱{metrics.shiftExpenses.toFixed(2)}</span>
                    )}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded border border-blue-200 border-l-4 border-blue-500">
                  <p className="text-gray-600">Net Balance: 
                    {loadingMetrics ? (
                      <span className="text-lg font-bold text-blue-600 animate-pulse">₱...</span>
                    ) : (
                      <span className="text-lg font-bold text-blue-600">₱{(metrics.shiftRevenue - metrics.shiftExpenses).toFixed(2)}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

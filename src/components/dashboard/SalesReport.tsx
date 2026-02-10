import React, { useState, useEffect } from 'react';
import { useToast } from '../common/ToastProvider';

interface SalesData {
  totalSales: number;
  transactions: number;
  dailyAverage: number;
  topProducts: string[];
}

const SalesReport: React.FC = () => {
  const { showToast } = useToast();
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'range'>('daily');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const generateReport = async () => {
    if (reportType === 'range' && (!startDate || !endDate)) {
      showToast('Please select both start and end dates', 'error');
      return;
    }

    setLoading(true);
    try {
      let url = `/api/reports?type=${reportType}`;
      if (reportType === 'range') {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report');
      }

      setSalesData(data);
      showToast('Report generated successfully!', 'success');
    } catch (error: any) {
      console.error('Error generating report:', error);
      showToast(error.message || 'Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Generate daily report by default
    generateReport();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4 text-[#03034b]">Sales Report</h3>
      
      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[#03034b]">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="border border-[#1827a0] rounded px-3 py-2 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:border-transparent"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="range">Date Range</option>
          </select>
        </div>
        
        {reportType === 'range' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1 text-[#03034b]">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-[#1827a0] rounded px-3 py-2 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[#03034b]">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-[#1827a0] rounded px-3 py-2 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:border-transparent"
              />
            </div>
          </>
        )}
        
        <button
          onClick={generateReport}
          disabled={loading}
          className="mt-6 px-4 py-2 rounded bg-[#1827a0] text-white hover:bg-[#0c5ee5] border border-[#03034b] disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
      
      {salesData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-[#e8e4d5] p-4 rounded border border-[#1827a0]">
            <div className="text-sm text-[#03034b]">Total Sales</div>
            <div className="text-2xl font-bold text-[#03034b]">₱{salesData.totalSales.toFixed(2)}</div>
          </div>
          <div className="bg-[#e8e4d5] p-4 rounded border border-[#1827a0]">
            <div className="text-sm text-[#03034b]">Transactions</div>
            <div className="text-2xl font-bold text-[#03034b]">{salesData.transactions}</div>
          </div>
          <div className="bg-[#e8e4d5] p-4 rounded border border-[#1827a0]">
            <div className="text-sm text-[#03034b]">Daily Average</div>
            <div className="text-2xl font-bold text-[#03034b]">₱{salesData.dailyAverage.toFixed(2)}</div>
          </div>
          <div className="bg-[#e8e4d5] p-4 rounded border border-[#1827a0]">
            <div className="text-sm text-[#03034b]">Top Products</div>
            <div className="text-lg font-bold text-[#03034b]">{salesData.topProducts[0]}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReport;
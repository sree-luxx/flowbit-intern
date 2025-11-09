'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api, Stats, InvoiceTrend, TopVendor, CategorySpend, CashOutflow, Invoice } from '@/lib/api';
import { OverviewCards } from './overview-cards';
import { InvoiceTrendChart } from './invoice-trend-chart';
import { VendorSpendChart } from './vendor-spend-chart';
import { CategorySpendChart } from './category-spend-chart';
import { CashOutflowChart } from './cash-outflow-chart';
import { VendorSummaryTable } from './vendor-summary-table';

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [trends, setTrends] = useState<InvoiceTrend[]>([]);
  const [topVendors, setTopVendors] = useState<TopVendor[]>([]);
  const [categorySpend, setCategorySpend] = useState<CategorySpend[]>([]);
  const [cashOutflow, setCashOutflow] = useState<CashOutflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        console.log('🔄 Loading dashboard data...');
        console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api');
        
        const [statsData, trendsData, vendorsData, categoryData, outflowData] = await Promise.all([
          api.getStats().catch(e => { console.error('Stats error:', e); throw e; }),
          api.getInvoiceTrends(12).catch(e => { console.error('Trends error:', e); throw e; }),
          api.getTopVendors().catch(e => { console.error('Vendors error:', e); throw e; }),
          api.getCategorySpend().catch(e => { console.error('Category error:', e); throw e; }),
          api.getCashOutflow().catch(e => { console.error('Cash outflow error:', e); throw e; }),
        ]);

        console.log('✅ Data loaded successfully:');
        console.log('  - Stats:', statsData);
        console.log('  - Trends:', trendsData.length, 'items');
        console.log('  - Vendors:', vendorsData.length, 'items');
        console.log('  - Categories:', categoryData.length, 'items');
        console.log('  - Cash Outflow:', outflowData.length, 'items');

        setStats(statsData);
        setTrends(trendsData);
        setTopVendors(vendorsData);
        setCategorySpend(categoryData);
        setCashOutflow(outflowData);
      } catch (error: any) {
        console.error('❌ Failed to load dashboard data:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
        
        let errorMessage = 'Failed to load dashboard data.';
        
        if (error.message?.includes('fetch')) {
          errorMessage = 'Cannot connect to API server. Make sure the backend is running on http://localhost:3001';
        } else if (error.message?.includes('Failed to fetch')) {
          errorMessage = 'API server is not responding. Check if it\'s running on http://localhost:3001';
        } else if (error.message?.includes('NetworkError')) {
          errorMessage = 'Network error. Check your internet connection and ensure the backend server is running.';
        } else {
          errorMessage = error.message || errorMessage;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-xl mb-2">⚠️ Error Loading Data</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Retry
          </button>
          <div className="mt-4 text-sm text-gray-500">
            <p>Make sure:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Backend API is running on http://localhost:3001</li>
              <li>Database is connected and seeded</li>
              <li>CORS is properly configured</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      {stats && <OverviewCards stats={stats} />}

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="border border-gray-200 shadow-md md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Invoice Volume + Value Trend</CardTitle>
            <CardDescription className="text-sm text-gray-500">Invoice count and total spend over 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            {trends.length > 0 ? (
            <InvoiceTrendChart data={trends} />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Spend by Vendor (Top 10)</CardTitle>
            <CardDescription className="text-sm text-gray-500">Vendor spend with cumulative percentage distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {topVendors.length > 0 ? (
            <VendorSpendChart data={topVendors} />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Spend by Category</CardTitle>
            <CardDescription className="text-sm text-gray-500">Distribution of spending across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            {categorySpend.length > 0 ? (
            <CategorySpendChart data={categorySpend} />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Cash Outflow Forecast</CardTitle>
            <CardDescription className="text-sm text-gray-500">Expected payment obligations grouped by due date ranges</CardDescription>
          </CardHeader>
          <CardContent>
            {cashOutflow.length > 0 ? (
            <CashOutflowChart data={cashOutflow} />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table - Vendor Summary */}
      <Card className="border border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Invoices by Vendor</CardTitle>
          <CardDescription className="text-sm text-gray-500">Top vendors by invoice count and net value</CardDescription>
        </CardHeader>
        <CardContent>
          {topVendors.length > 0 ? (
            <VendorSummaryTable vendors={topVendors} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No vendor data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

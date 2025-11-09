'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TopVendor } from '@/lib/api';

interface VendorSpendChartProps {
  data: TopVendor[];
}

export function VendorSpendChart({ data }: VendorSpendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No data available
      </div>
    );
  }

  const chartData = data
    .map((vendor) => ({
      name: vendor.vendorName.length > 20 ? vendor.vendorName.substring(0, 20) + '...' : vendor.vendorName,
      'Total Spend': Math.round(vendor.totalSpend),
    }))
    .reverse(); // Reverse to show highest at top

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          type="number" 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
        />
        <YAxis 
          dataKey="name" 
          type="category" 
          width={120}
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
          formatter={(value: number) => `€ ${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <Legend />
        <Bar 
          dataKey="Total Spend" 
          fill="#e0e7ff"
          radius={[0, 8, 8, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}


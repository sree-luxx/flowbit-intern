'use client';

import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { InvoiceTrend } from '@/lib/api';

interface InvoiceTrendChartProps {
  data: InvoiceTrend[];
}

export function InvoiceTrendChart({ data }: InvoiceTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
    'Invoice Count': item.invoiceCount,
    'Total Value': Math.round(item.totalValue),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          yAxisId="left" 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          label={{ value: 'Invoice Count', angle: -90, position: 'insideLeft' }}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
          label={{ value: 'Total Value (€)', angle: 90, position: 'insideRight' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
          formatter={(value: number, name: string) => {
            if (name === 'Total Value') {
              return [`€ ${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name];
            }
            return [value, name];
          }}
        />
        <Legend />
        <Bar 
          yAxisId="right" 
          dataKey="Total Value" 
          fill="#e0e7ff" 
          name="Total Value"
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="Invoice Count"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
          name="Invoice Count"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}


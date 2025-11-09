'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CashOutflow } from '@/lib/api';

interface CashOutflowChartProps {
  data: CashOutflow[];
}

export function CashOutflowChart({ data }: CashOutflowChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No data available
      </div>
    );
  }

  // Group by date ranges: 0-7 days, 8-30 days, 31-60 days, 60+ days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const ranges = {
    '0-7 days': 0,
    '8-30 days': 0,
    '31-60 days': 0,
    '60+ days': 0,
  };

  data.forEach((item) => {
    const dueDate = new Date(item.date);
    dueDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 0 && daysDiff <= 7) {
      ranges['0-7 days'] += item.amount;
    } else if (daysDiff >= 8 && daysDiff <= 30) {
      ranges['8-30 days'] += item.amount;
    } else if (daysDiff >= 31 && daysDiff <= 60) {
      ranges['31-60 days'] += item.amount;
    } else if (daysDiff > 60) {
      ranges['60+ days'] += item.amount;
    } else {
      // Past due dates go to 0-7 days
      ranges['0-7 days'] += item.amount;
    }
  });

  const chartData = Object.entries(ranges).map(([range, amount]) => ({
    range,
    amount: Math.round(amount),
  })).filter(item => item.amount > 0);

  if (chartData.length === 0) {
    // If no data in ranges, show individual dates
    const individualData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: Math.round(item.amount),
  }));
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={individualData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
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
          <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="range" 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
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
        <Bar dataKey="amount" fill="#9333ea" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}


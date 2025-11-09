'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CategorySpend } from '@/lib/api';

interface CategorySpendChartProps {
  data: CategorySpend[];
}

const COLORS = ['#3b82f6', '#f97316', '#60a5fa', '#8b5cf6', '#6366f1', '#4f46e5', '#818cf8'];

export function CategorySpendChart({ data }: CategorySpendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.category || 'Uncategorized',
    value: Math.round(item.total),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={false}
          outerRadius={90}
          innerRadius={50}
          fill="#3b82f6"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
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
      </PieChart>
    </ResponsiveContainer>
  );
}


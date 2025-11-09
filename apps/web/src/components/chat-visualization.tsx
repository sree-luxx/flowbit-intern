'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartData {
  type: string;
  config: {
    x?: string;
    y?: string | string[];
    dataKey?: string;
    value?: string;
    label?: string;
  };
}

interface ChatVisualizationProps {
  data: any[];
  chart?: ChartData | null;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#6366f1', '#4f46e5', '#818cf8', '#a78bfa', '#60a5fa'];

export function ChatVisualization({ data, chart }: ChatVisualizationProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // Format currency values
  const formatCurrency = (value: any) => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value).replace('EUR', '€');
    }
    return value;
  };

  // Format numbers
  const formatNumber = (value: any) => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('de-DE').format(value);
    }
    return value;
  };

  // Helper function to convert value to number if it's a numeric string
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/,/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!chart || !chart.config) return null;

    const { x, y } = chart.config;
    
    if (!x && !y) return null;

    return data.map((row) => {
      const chartRow: any = {};
      
      if (x) {
        chartRow[x] = row[x];
      }
      
      if (y) {
        if (Array.isArray(y)) {
          y.forEach((key) => {
            const value = row[key];
            chartRow[key] = value !== null && value !== undefined ? toNumber(value) : 0;
          });
        } else {
          const value = row[y];
          chartRow[y] = value !== null && value !== undefined ? toNumber(value) : 0;
        }
      }
      
      return chartRow;
    });
  };

  const chartData = prepareChartData();

  // Render metric card for single value
  if (chart?.type === 'metric' && data.length === 1) {
    const value = chart.config.value ? data[0][chart.config.value] : data[0];
    const label = chart.config.label || chart.config.value || 'Value';
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Result</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {typeof value === 'number' ? formatCurrency(value) : formatNumber(value)}
            </div>
            <div className="text-muted-foreground text-sm uppercase tracking-wide">
              {label}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render bar chart
  if (chart?.type === 'bar' && chartData && chartData.length > 0) {
    const { x, y } = chart.config;
    if (!x || !y) return null;
    
    const yKeys = Array.isArray(y) ? y.filter(Boolean) : [y].filter(Boolean);
    if (yKeys.length === 0) return null;
    
    // Check if we should use vertical layout (when x-axis labels are long)
    const useVerticalLayout = chartData.length <= 15 && chartData.some((row: any) => {
      const xValue = row[x];
      return xValue && typeof xValue === 'string' && xValue.length > 15;
    });
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visualization</CardTitle>
          <CardDescription>Bar Chart</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto overflow-y-auto" style={{ maxHeight: '500px', maxWidth: '100%' }}>
            <div style={{ minWidth: '600px', minHeight: '400px' }}>
          <ResponsiveContainer width="100%" height={400}>
            {useVerticalLayout ? (
              <BarChart 
                data={chartData} 
                layout="vertical"
                margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => {
                    if (typeof value === 'number' && value >= 1000) {
                      return `€${(value / 1000).toFixed(0)}k`;
                    }
                    return formatNumber(value);
                  }}
                />
                <YAxis 
                  type="category"
                  dataKey={x}
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: any) => {
                    if (typeof value === 'number') {
                      return formatCurrency(value);
                    }
                    return value;
                  }}
                />
                <Legend />
                {yKeys.map((key, index) => (
                  <Bar
                    key={key || index}
                    dataKey={key}
                    fill={COLORS[index % COLORS.length]}
                    radius={[0, 8, 8, 0]}
                  />
                ))}
              </BarChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey={x}
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  angle={chartData.length > 10 ? -45 : 0}
                  textAnchor={chartData.length > 10 ? 'end' : 'middle'}
                  height={chartData.length > 10 ? 100 : 30}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => {
                    if (typeof value === 'number' && value >= 1000) {
                      return `€${(value / 1000).toFixed(0)}k`;
                    }
                    return formatNumber(value);
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: any) => {
                    if (typeof value === 'number') {
                      return formatCurrency(value);
                    }
                    return value;
                  }}
                />
                <Legend />
                {yKeys.map((key, index) => (
                  <Bar
                    key={key || index}
                    dataKey={key}
                    fill={COLORS[index % COLORS.length]}
                    radius={[8, 8, 0, 0]}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render line chart
  if (chart?.type === 'line' && chartData && chartData.length > 0) {
    const { x, y } = chart.config;
    if (!x || !y) return null;
    
    const yKeys = Array.isArray(y) ? y.filter(Boolean) : [y].filter(Boolean);
    if (yKeys.length === 0) return null;
    
    // Format date data for better display
    const formattedData = chartData.map((row: any) => {
      const formattedRow: any = { ...row };
      // Try to format date strings
      if (row[x] && typeof row[x] === 'string' && /^\d{4}-\d{2}-\d{2}/.test(row[x])) {
        try {
          const date = new Date(row[x]);
          formattedRow[x] = new Intl.DateTimeFormat('de-DE', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
          }).format(date);
        } catch {
          // Keep original if parsing fails
        }
      }
      return formattedRow;
    });
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visualization</CardTitle>
          <CardDescription>Line Chart - Trend Over Time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto overflow-y-auto" style={{ maxHeight: '500px', maxWidth: '100%' }}>
            <div style={{ minWidth: '600px', minHeight: '400px' }}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey={x}
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                angle={formattedData.length > 10 ? -45 : 0}
                textAnchor={formattedData.length > 10 ? 'end' : 'middle'}
                height={formattedData.length > 10 ? 100 : 30}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => {
                  if (typeof value === 'number' && value >= 1000) {
                    return `€${(value / 1000).toFixed(0)}k`;
                  }
                  return formatNumber(value);
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
                formatter={(value: any) => {
                  if (typeof value === 'number') {
                    return formatCurrency(value);
                  }
                  return value;
                }}
              />
              <Legend />
              {yKeys.map((key, index) => (
                <Line
                  key={key || index}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: COLORS[index % COLORS.length], r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render pie chart for categorical data
  if (chart?.type === 'pie' && chartData && chartData.length > 0) {
    const { x, y } = chart.config;
    if (!x || !y) return null;
    
    const yKey = Array.isArray(y) ? y[0] : y;
    if (!yKey) return null;
    
    // Sort by value descending for better visualization
    const sortedData = [...chartData].sort((a: any, b: any) => {
      const aVal = Number(a[yKey]) || 0;
      const bVal = Number(b[yKey]) || 0;
      return bVal - aVal;
    });
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visualization</CardTitle>
          <CardDescription>Distribution Chart</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto overflow-y-auto" style={{ maxHeight: '500px', maxWidth: '100%' }}>
            <div className="flex justify-center" style={{ minWidth: '600px', minHeight: '400px' }}>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={sortedData}
                dataKey={yKey}
                nameKey={x}
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, value }: any) => {
                  const label = name && name.length > 15 ? `${name.substring(0, 15)}...` : name;
                  return `${label}: ${formatCurrency(value)}`;
                }}
                labelLine={false}
              >
                {sortedData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
              />
              <Legend
                formatter={(value: string) => {
                  return value && value.length > 20 ? `${value.substring(0, 20)}...` : value;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}


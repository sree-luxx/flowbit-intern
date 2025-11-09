'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stats } from '@/lib/api';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface OverviewCardsProps {
  stats: Stats;
}

export function OverviewCards({ stats }: OverviewCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value).replace('EUR', '€');
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('de-DE').format(value);
  };

  // Calculate percentage changes (mock data for now)
  const changes = {
    totalSpend: { value: 8.2, positive: true },
    invoicesProcessed: { value: 8.2, positive: true },
    documentsUploaded: { value: -8, positive: false },
    averageInvoiceValue: { value: 8.2, positive: true },
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Total Spend (YTD)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2 text-gray-900">{formatCurrency(stats.totalSpend)}</div>
          <div className="flex items-center space-x-1 text-sm">
            {changes.totalSpend.positive ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={changes.totalSpend.positive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {changes.totalSpend.positive ? '+' : ''}{changes.totalSpend.value}% from last month
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Total Invoices Processed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2 text-gray-900">{formatNumber(stats.totalInvoicesProcessed)}</div>
          <div className="flex items-center space-x-1 text-sm">
            {changes.invoicesProcessed.positive ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={changes.invoicesProcessed.positive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {changes.invoicesProcessed.positive ? '+' : ''}{changes.invoicesProcessed.value}% from last month
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Documents Uploaded (This Month)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2 text-gray-900">{formatNumber(stats.documentsUploaded)}</div>
          <div className="flex items-center space-x-1 text-sm">
            {changes.documentsUploaded.positive ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={changes.documentsUploaded.positive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {changes.documentsUploaded.positive ? '+' : ''}{Math.abs(changes.documentsUploaded.value)} less from last month
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Average Invoice Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2 text-gray-900">{formatCurrency(stats.averageInvoiceValue)}</div>
          <div className="flex items-center space-x-1 text-sm">
            {changes.averageInvoiceValue.positive ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={changes.averageInvoiceValue.positive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {changes.averageInvoiceValue.positive ? '+' : ''}{changes.averageInvoiceValue.value}% from last month
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


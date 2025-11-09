'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Mail, Phone, Building, TrendingUp, FileText } from 'lucide-react';
import { api, Customer, TopCustomer } from '@/lib/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function Customers() {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    setError(null);
    try {
      const [customersData, topCustomersData] = await Promise.all([
        api.getCustomers(),
        api.getTopCustomers(10),
      ]);
      setCustomers(customersData);
      setTopCustomers(topCustomersData);
    } catch (err: any) {
      console.error('Failed to load customers:', err);
      setError(err.message || 'Failed to load customers');
      setCustomers([]);
      setTopCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(search.toLowerCase())) ||
      (customer.phone && customer.phone.toLowerCase().includes(search.toLowerCase()))
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(value)
      .replace('EUR', '€');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Prepare chart data for top customers
  const topCustomersChartData = topCustomers.map((customer) => ({
    name: customer.customerName.length > 15
      ? customer.customerName.substring(0, 15) + '...'
      : customer.customerName,
    value: customer.totalValue,
    invoices: customer.invoiceCount,
  }));

  // Prepare chart data for customer distribution
  const customerDistributionData = [
    {
      name: '0-5',
      count: customers.filter((c) => c.totalInvoices >= 0 && c.totalInvoices <= 5).length,
    },
    {
      name: '6-10',
      count: customers.filter((c) => c.totalInvoices >= 6 && c.totalInvoices <= 10).length,
    },
    {
      name: '11-20',
      count: customers.filter((c) => c.totalInvoices >= 11 && c.totalInvoices <= 20).length,
    },
    {
      name: '21-50',
      count: customers.filter((c) => c.totalInvoices >= 21 && c.totalInvoices <= 50).length,
    },
    {
      name: '50+',
      count: customers.filter((c) => c.totalInvoices > 50).length,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">Loading customers...</div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-red-500">
              <p className="text-lg">Error loading customers</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customers.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Invoice Value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    customers.reduce((sum, c) => sum + c.totalValue, 0)
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customers.reduce((sum, c) => sum + c.totalInvoices, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg. Value per Customer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customers.length > 0
                    ? formatCurrency(
                        customers.reduce((sum, c) => sum + c.totalValue, 0) /
                          customers.length
                      )
                    : '€0.00'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Customers Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top Customers by Value</CardTitle>
                <CardDescription>Top 10 customers by total invoice value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto" style={{ maxHeight: '400px', maxWidth: '100%' }}>
                  <div style={{ minWidth: '500px', minHeight: '300px' }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topCustomersChartData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          type="number"
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                          tickFormatter={(value) => {
                            if (typeof value === 'number' && value >= 1000) {
                              return `€${(value / 1000).toFixed(0)}k`;
                            }
                            return `€${value}`;
                          }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                          width={100}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                          }}
                          formatter={(value: any) => formatCurrency(value)}
                        />
                        <Legend />
                        <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Distribution by Invoice Count</CardTitle>
                <CardDescription>Number of customers by invoice count ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto" style={{ maxHeight: '400px', maxWidth: '100%' }}>
                  <div style={{ minWidth: '500px', minHeight: '300px' }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={customerDistributionData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="name"
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                          label={{ value: 'Invoice Count Range', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer List */}
          <Card>
            <CardHeader>
              <CardTitle>All Customers</CardTitle>
              <CardDescription>
                {filteredCustomers.length} customer(s) found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No customers found</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCustomers.map((customer) => (
                    <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200">
                            <span className="text-blue-600 font-semibold text-sm">
                              {getInitials(customer.name)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{customer.name}</CardTitle>
                            {customer.email && (
                              <CardDescription className="flex items-center space-x-1 mt-1">
                                <Mail className="w-3 h-3" />
                                <span className="text-xs">{customer.email}</span>
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {customer.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-900">{customer.phone}</span>
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-900">{customer.address}</span>
                          </div>
                        )}
                        <div className="border-t pt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">Total Invoices</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {customer.totalInvoices}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">Total Value</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(customer.totalValue)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Paid</span>
                            <span className="text-green-600 font-medium">
                              {customer.paidInvoices}
                            </span>
                            <span className="text-gray-500">Pending</span>
                            <span className="text-yellow-600 font-medium">
                              {customer.pendingInvoices}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}


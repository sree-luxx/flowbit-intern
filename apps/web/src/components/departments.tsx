'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, DollarSign, FileText } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  members: number;
  budget: number;
  spent: number;
  invoices: number;
  manager: string;
}

export function Departments() {
  const [departments] = useState<Department[]>([
    {
      id: '1',
      name: 'Finance',
      members: 8,
      budget: 500000,
      spent: 320000,
      invoices: 45,
      manager: 'John Smith',
    },
    {
      id: '2',
      name: 'Operations',
      members: 12,
      budget: 750000,
      spent: 580000,
      invoices: 78,
      manager: 'Sarah Johnson',
    },
    {
      id: '3',
      name: 'Marketing',
      members: 6,
      budget: 300000,
      spent: 245000,
      invoices: 32,
      manager: 'Mike Davis',
    },
    {
      id: '4',
      name: 'IT',
      members: 10,
      budget: 600000,
      spent: 420000,
      invoices: 56,
      manager: 'Emily Chen',
    },
    {
      id: '5',
      name: 'HR',
      members: 5,
      budget: 250000,
      spent: 180000,
      invoices: 24,
      manager: 'David Wilson',
    },
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('EUR', '€');
  };

  const getBudgetPercentage = (spent: number, budget: number) => {
    return Math.round((spent / budget) * 100);
  };

  const getBudgetColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <Card key={dept.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{dept.name}</CardTitle>
                    <CardDescription>Managed by {dept.manager}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Members</div>
                    <div className="font-semibold">{dept.members}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Invoices</div>
                    <div className="font-semibold">{dept.invoices}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Budget</span>
                  <span className="font-semibold">{formatCurrency(dept.budget)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Spent</span>
                  <span className="font-semibold">{formatCurrency(dept.spent)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      getBudgetPercentage(dept.spent, dept.budget) >= 90
                        ? 'bg-red-500'
                        : getBudgetPercentage(dept.spent, dept.budget) >= 75
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min(getBudgetPercentage(dept.spent, dept.budget), 100)}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Remaining</span>
                  <span
                    className={`font-semibold ${getBudgetColor(
                      getBudgetPercentage(dept.spent, dept.budget)
                    )}`}
                  >
                    {formatCurrency(dept.budget - dept.spent)} (
                    {getBudgetPercentage(dept.spent, dept.budget)}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Summary</CardTitle>
          <CardDescription>Overview of all departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{departments.length}</div>
              <div className="text-sm text-gray-600">Total Departments</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {departments.reduce((sum, dept) => sum + dept.members, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Members</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  departments.reduce((sum, dept) => sum + dept.budget, 0) -
                    departments.reduce((sum, dept) => sum + dept.spent, 0)
                )}
              </div>
              <div className="text-sm text-gray-600">Total Remaining Budget</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {departments.reduce((sum, dept) => sum + dept.invoices, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Invoices</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


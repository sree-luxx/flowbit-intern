'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TopVendor } from '@/lib/api';

interface VendorSummaryTableProps {
  vendors: TopVendor[];
}

export function VendorSummaryTable({ vendors }: VendorSummaryTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value).replace('EUR', '€');
  };

  if (!vendors || vendors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No vendor data available
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold text-gray-700">Vendor</TableHead>
            <TableHead className="font-semibold text-gray-700 text-right">#Invoices</TableHead>
            <TableHead className="font-semibold text-gray-700 text-right">Net Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map((vendor) => (
            <TableRow key={vendor.vendorId}>
              <TableCell className="font-medium">{vendor.vendorName}</TableCell>
              <TableCell className="text-right">{vendor.invoiceCount}</TableCell>
              <TableCell className="text-right font-semibold">{formatCurrency(vendor.totalSpend)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}







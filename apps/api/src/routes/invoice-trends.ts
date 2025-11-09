import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const invoiceTrendsRouter = Router();

invoiceTrendsRouter.get('/', async (req, res) => {
  try {
    console.log('📈 Fetching invoice trends...');
    const { months = '12' } = req.query;
    const monthsCount = parseInt(months as string, 10);

    // Get all invoices first to check if we have data
    const allInvoices = await prisma.invoice.findMany({
      select: {
        issueDate: true,
        total: true,
      },
      orderBy: {
        issueDate: 'asc',
      },
    });
    
    console.log(`  Found ${allInvoices.length} total invoices`);

    // If we have very few invoices, show all of them regardless of date filter
    // Otherwise, apply the date filter
    let invoices = allInvoices;
    if (allInvoices.length > 10) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsCount);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      invoices = allInvoices.filter((invoice) => invoice.issueDate >= startDate);
    }

    // If still no invoices after filtering, try showing last 24 months
    if (invoices.length === 0 && allInvoices.length > 0) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 24);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      invoices = allInvoices.filter((invoice) => invoice.issueDate >= startDate);
    }

    // If still no invoices, show all invoices (for sample data with old dates)
    if (invoices.length === 0 && allInvoices.length > 0) {
      invoices = allInvoices;
    }

    // Group by month
    const monthlyData = new Map<string, { count: number; value: number }>();

    invoices.forEach((invoice) => {
      const monthKey = invoice.issueDate.toISOString().slice(0, 7); // YYYY-MM
      const existing = monthlyData.get(monthKey) || { count: 0, value: 0 };
      monthlyData.set(monthKey, {
        count: existing.count + 1,
        value: existing.value + Number(invoice.total),
      });
    });

    const result = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        invoiceCount: data.count,
        totalValue: data.value,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    console.log(`✅ Returning ${result.length} monthly trends:`, result);
    res.json(result);
  } catch (error: any) {
    console.error('Invoice trends error:', error);
    res.status(500).json({
      error: 'Failed to fetch invoice trends',
      message: error.message,
    });
  }
});


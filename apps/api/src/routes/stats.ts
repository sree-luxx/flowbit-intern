import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const statsRouter = Router();

statsRouter.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching stats...');
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    // Get total count first to check if we have data
    const totalInvoiceCount = await prisma.invoice.count();
    console.log(`  Total invoices in database: ${totalInvoiceCount}`);
    
    // If we have very few invoices, show all data regardless of year filter
    // This helps with sample data that might have dates from previous years
    let dateFilter: any = {};
    if (totalInvoiceCount > 10) {
      dateFilter = {
      issueDate: {
        gte: yearStart,
        lte: yearEnd,
      },
      };
      console.log('  Using YTD filter (current year)');
    } else {
      console.log('  Using all-time data (few invoices)');
    }

    // Total Spend (YTD) - or all time if few invoices
    const totalSpendResult = await prisma.invoice.aggregate({
      where: dateFilter,
    _sum: {
      total: true,
    },
  });

  // Total Invoices Processed
    const totalInvoices = Object.keys(dateFilter).length > 0
      ? await prisma.invoice.count({ where: dateFilter })
      : totalInvoiceCount;

  // Documents Uploaded (total invoices)
    const documentsUploaded = totalInvoiceCount;

  // Average Invoice Value
  const avgInvoiceResult = await prisma.invoice.aggregate({
      where: dateFilter,
    _avg: {
      total: true,
    },
  });

    // If no YTD data but we have total data, use all-time average
    let averageInvoiceValue = Number(avgInvoiceResult._avg.total || 0);
    if (averageInvoiceValue === 0 && totalInvoiceCount > 0) {
      const allTimeAvg = await prisma.invoice.aggregate({ _avg: { total: true } });
      averageInvoiceValue = Number(allTimeAvg._avg.total || 0);
    }

    let totalSpend = Number(totalSpendResult._sum.total || 0);
    if (totalSpend === 0 && totalInvoiceCount > 0) {
      const allTimeSum = await prisma.invoice.aggregate({ _sum: { total: true } });
      totalSpend = Number(allTimeSum._sum.total || 0);
    }

    const result = {
      totalSpend,
      totalInvoicesProcessed: totalInvoices,
      documentsUploaded,
      averageInvoiceValue,
    };

    console.log('✅ Stats calculated:', result);
    res.json(result);
  } catch (error: any) {
    console.error('❌ Stats route error:', error);
    res.status(500).json({
      error: 'Failed to fetch stats',
      message: error.message,
      hint: 'Check if database is connected and seeded',
    });
  }
});


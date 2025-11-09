import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const cashOutflowRouter = Router();

cashOutflowRouter.get('/', async (req, res) => {
  try {
    console.log('💰 Fetching cash outflow...');
    const { startDate, endDate } = req.query;

    // Get all invoices with due dates (not just pending/overdue)
    // This allows us to show forecast even for future due dates
    let whereClause: any = {
      dueDate: {
        not: null,
      },
    };

    // Filter by date range if provided
    if (startDate || endDate) {
      whereClause.dueDate = {
        not: null,
      };
      if (startDate) {
        whereClause.dueDate.gte = new Date(startDate as string);
      }
      if (endDate) {
        whereClause.dueDate.lte = new Date(endDate as string);
      }
    } else {
      // Default: show next 90 days from today
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 90);
      whereClause.dueDate = {
        gte: today,
        lte: futureDate,
      };
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      select: {
        id: true,
        dueDate: true,
        total: true,
        status: true,
        payments: {
          select: {
            amount: true,
          },
        },
      },
    });

    // Calculate outstanding amounts
    const dateMap = new Map<string, number>();

    invoices.forEach((invoice) => {
      const paidAmount = invoice.payments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      );
      const outstanding = Number(invoice.total) - paidAmount;

      // Include invoices that are not fully paid OR are pending/overdue
      // This gives a better forecast view
      if (invoice.dueDate && (outstanding > 0 || invoice.status === 'PENDING' || invoice.status === 'OVERDUE' || invoice.status === 'PARTIAL')) {
        const dateKey = invoice.dueDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const existing = dateMap.get(dateKey) || 0;
        // For forecast, show the total amount if not fully paid, or outstanding if partially paid
        const forecastAmount = outstanding > 0 ? outstanding : Number(invoice.total);
        dateMap.set(dateKey, existing + forecastAmount);
      }
    });

    // If no data with default filter, try showing all invoices with due dates (past and future)
    if (dateMap.size === 0 && !startDate && !endDate) {
      const allInvoices = await prisma.invoice.findMany({
        where: {
          dueDate: {
            not: null,
          },
        },
        select: {
          id: true,
          dueDate: true,
          total: true,
          status: true,
          payments: {
            select: {
              amount: true,
            },
          },
        },
      });

      allInvoices.forEach((invoice) => {
        if (invoice.dueDate) {
          const paidAmount = invoice.payments.reduce(
            (sum, payment) => sum + Number(payment.amount),
            0
          );
          const outstanding = Number(invoice.total) - paidAmount;
          const amount = outstanding > 0 ? outstanding : Number(invoice.total);
          
          const dateKey = invoice.dueDate.toISOString().split('T')[0];
          const existing = dateMap.get(dateKey) || 0;
          dateMap.set(dateKey, existing + amount);
      }
    });
    }

    const result = Array.from(dateMap.entries())
      .map(([date, amount]) => ({
        date,
        amount: Number(amount),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    console.log(`✅ Returning ${result.length} cash outflow entries:`, result);
    res.json(result);
  } catch (error: any) {
    console.error('Cash outflow error:', error);
    res.status(500).json({
      error: 'Failed to fetch cash outflow',
      message: error.message,
    });
  }
});


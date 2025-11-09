import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const customersRouter = Router();

// Get all customers (must come first, before parameter routes)
customersRouter.get('/', async (req, res) => {
  try {
    console.log('📥 GET /api/customers - Request received');
    const customers = await prisma.customer.findMany({
      include: {
        invoices: {
          select: {
            id: true,
            total: true,
            status: true,
            issueDate: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const customersWithStats = customers.map((customer) => {
      const totalInvoices = customer.invoices.length;
      const totalValue = customer.invoices.reduce(
        (sum, inv) => sum + Number(inv.total),
        0
      );
      const paidInvoices = customer.invoices.filter(
        (inv) => inv.status === 'PAID'
      ).length;
      const pendingInvoices = customer.invoices.filter(
        (inv) => inv.status === 'PENDING'
      ).length;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        taxId: customer.taxId,
        totalInvoices,
        totalValue,
        paidInvoices,
        pendingInvoices,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      };
    });

    console.log(`✅ Found ${customersWithStats.length} customers`);
    res.json(customersWithStats);
  } catch (error: any) {
    console.error('❌ Customers error:', error);
    res.status(500).json({
      error: 'Failed to fetch customers',
      message: error.message || 'Unknown error occurred',
    });
  }
});

// Get top customers by invoice value (must come before /:id route)
customersRouter.get('/top', async (req, res) => {
  try {
    const { limit = '10' } = req.query;
    const limitNum = parseInt(limit as string, 10);

    const topCustomers = await prisma.invoice.groupBy({
      by: ['customerId'],
      where: {
        customerId: {
          not: null,
        },
      },
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: limitNum,
    });

    const customerIds = topCustomers
      .map((c) => c.customerId)
      .filter((id): id is string => id !== null);

    const customers = await prisma.customer.findMany({
      where: {
        id: {
          in: customerIds,
        },
      },
    });

    const customerMap = new Map(customers.map((c) => [c.id, c]));

    const result = topCustomers
      .filter((c) => c.customerId !== null)
      .map((customer) => ({
        customerId: customer.customerId!,
        customerName: customerMap.get(customer.customerId!)?.name || 'Unknown',
        totalValue: Number(customer._sum.total || 0),
        invoiceCount: customer._count.id,
      }));

    res.json(result);
  } catch (error: any) {
    console.error('Top customers error:', error);
    res.status(500).json({
      error: 'Failed to fetch top customers',
      message: error.message || 'Unknown error occurred',
    });
  }
});

// Get customer invoice trends (must come before /:id route)
customersRouter.get('/:id/trends', async (req, res) => {
  try {
    const { id } = req.params;
    const { months = '12' } = req.query;
    const monthsNum = parseInt(months as string, 10);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsNum);

    const invoices = await prisma.invoice.findMany({
      where: {
        customerId: id,
        issueDate: {
          gte: startDate,
        },
      },
      orderBy: {
        issueDate: 'asc',
      },
    });

    // Group by month
    const monthlyData = new Map<string, { count: number; total: number }>();

    invoices.forEach((invoice) => {
      const month = invoice.issueDate.toISOString().substring(0, 7); // YYYY-MM
      const existing = monthlyData.get(month) || { count: 0, total: 0 };
      monthlyData.set(month, {
        count: existing.count + 1,
        total: existing.total + Number(invoice.total),
      });
    });

    const result = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        invoiceCount: data.count,
        totalValue: data.total,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json(result);
  } catch (error: any) {
    console.error('Customer trends error:', error);
    res.status(500).json({
      error: 'Failed to fetch customer trends',
      message: error.message || 'Unknown error occurred',
    });
  }
});

// Get customer by ID (must come last, after all specific routes)
customersRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        invoices: {
          include: {
            vendor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            issueDate: 'desc',
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error: any) {
    console.error('Customer error:', error);
    res.status(500).json({
      error: 'Failed to fetch customer',
      message: error.message || 'Unknown error occurred',
    });
  }
});

import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const invoicesRouter = Router();

invoicesRouter.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '50',
      search,
      status,
      vendorId,
      sortBy = 'issueDate',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search as string, mode: 'insensitive' } },
        { vendor: { name: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (vendorId) {
      where.vendorId = vendorId;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
          payments: {
            select: {
              amount: true,
            },
          },
        },
        orderBy: {
          [sortBy as string]: sortOrder as 'asc' | 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.invoice.count({ where }),
    ]);

    const result = invoices.map((invoice) => {
      const paidAmount = invoice.payments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      );
      const outstanding = Number(invoice.total) - paidAmount;

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        vendor: invoice.vendor.name,
        vendorId: invoice.vendor.id,
        customer: invoice.customer?.name || null,
        issueDate: invoice.issueDate.toISOString(),
        dueDate: invoice.dueDate?.toISOString() || null,
        status: invoice.status,
        amount: Number(invoice.total),
        outstanding,
        currency: invoice.currency,
      };
    });

    res.json({
      data: result,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Invoices error:', error);
    res.status(500).json({
      error: 'Failed to fetch invoices',
      message: error.message,
    });
  }
});


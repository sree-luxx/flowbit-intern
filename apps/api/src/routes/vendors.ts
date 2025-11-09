import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const vendorsRouter = Router();

vendorsRouter.get('/top10', async (req, res) => {
  try {
    console.log('🏢 Fetching top vendors...');
    const topVendors = await prisma.invoice.groupBy({
      by: ['vendorId'],
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
      take: 10,
    });

    const vendorIds = topVendors.map((v) => v.vendorId);
    const vendors = await prisma.vendor.findMany({
      where: {
        id: {
          in: vendorIds,
        },
      },
    });

    const vendorMap = new Map(vendors.map((v) => [v.id, v]));

    const result = topVendors.map((vendor) => ({
      vendorId: vendor.vendorId,
      vendorName: vendorMap.get(vendor.vendorId)?.name || 'Unknown',
      totalSpend: Number(vendor._sum.total || 0),
      invoiceCount: vendor._count.id,
    }));

    console.log(`✅ Returning ${result.length} top vendors:`, result);
    res.json(result);
  } catch (error: any) {
    console.error('Vendors error:', error);
    res.status(500).json({
      error: 'Failed to fetch vendors',
      message: error.message,
    });
  }
});


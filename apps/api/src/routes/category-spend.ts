import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const categorySpendRouter = Router();

categorySpendRouter.get('/', async (req, res) => {
  try {
    console.log('📂 Fetching category spend...');
    const lineItems = await prisma.lineItem.findMany({
      where: {
        category: {
          not: null,
        },
      },
      select: {
        category: true,
        amount: true,
      },
    });

    const categoryMap = new Map<string, number>();

    lineItems.forEach((item) => {
      if (item.category) {
        const existing = categoryMap.get(item.category) || 0;
        categoryMap.set(item.category, existing + Number(item.amount));
      }
    });

    const result = Array.from(categoryMap.entries())
      .map(([category, total]) => ({
        category,
        total: Number(total),
      }))
      .sort((a, b) => b.total - a.total);

    console.log(`✅ Returning ${result.length} categories:`, result);
    res.json(result);
  } catch (error: any) {
    console.error('Category spend error:', error);
    res.status(500).json({
      error: 'Failed to fetch category spend',
      message: error.message,
    });
  }
});


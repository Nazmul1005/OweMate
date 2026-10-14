const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * GET /api/dashboard
 * Returns three financial totals:
 *  - personalBalance: PERSONAL_INCOME - PERSONAL_EXPENSE
 *  - totalOwedToMe:   sum of LENT_TO_FRIEND
 *  - totalIOwe:       sum of BORROWED_FROM_FRIEND
 *  - recentTransactions: last 10 transactions
 */
router.get('/', async (req, res) => {
  try {
    // Aggregate all amounts grouped by transaction_type in a single DB call
    const aggregates = await prisma.transaction.groupBy({
      by: ['transaction_type'],
      _sum: { amount: true },
      _count: { id: true },
    });

    // Build a lookup map: { PERSONAL_INCOME: 1200.00, ... }
    const totals = {};
    for (const agg of aggregates) {
      totals[agg.transaction_type] = agg._sum.amount ?? 0;
    }

    const personalIncome = totals['PERSONAL_INCOME'] ?? 0;
    const personalExpense = totals['PERSONAL_EXPENSE'] ?? 0;
    const totalOwedToMe = totals['LENT_TO_FRIEND'] ?? 0;
    const totalIOwe = totals['BORROWED_FROM_FRIEND'] ?? 0;

    const personalBalance = personalIncome - personalExpense;

    // Recent transactions (last 10, all types)
    const recentTransactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      take: 10,
    });

    return res.status(200).json({
      success: true,
      data: {
        personalBalance: parseFloat(personalBalance.toFixed(2)),
        totalOwedToMe: parseFloat(totalOwedToMe.toFixed(2)),
        totalIOwe: parseFloat(totalIOwe.toFixed(2)),
        netWorth: parseFloat((personalBalance + totalOwedToMe - totalIOwe).toFixed(2)),
        recentTransactions,
      },
    });
  } catch (error) {
    console.error('GET /dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

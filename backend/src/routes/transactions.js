const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * POST /api/transactions
 * Create a new transaction record.
 * Body: { amount, transaction_type, friend_name?, description, date? }
 */
router.post('/', async (req, res) => {
  try {
    const { amount, transaction_type, friend_name, description, date } = req.body;

    // Validation
    if (!amount || !transaction_type || !description) {
      return res.status(400).json({
        error: 'Missing required fields: amount, transaction_type, description',
      });
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const validTypes = [
      'PERSONAL_EXPENSE',
      'PERSONAL_INCOME',
      'LENT_TO_FRIEND',
      'BORROWED_FROM_FRIEND',
    ];
    if (!validTypes.includes(transaction_type)) {
      return res.status(400).json({
        error: `transaction_type must be one of: ${validTypes.join(', ')}`,
      });
    }

    // Friend name required for peer-to-peer types
    if (
      (transaction_type === 'LENT_TO_FRIEND' ||
        transaction_type === 'BORROWED_FROM_FRIEND') &&
      !friend_name
    ) {
      return res.status(400).json({
        error: 'friend_name is required for LENT_TO_FRIEND and BORROWED_FROM_FRIEND',
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        transaction_type,
        friend_name: friend_name || null,
        description: description.trim(),
        date: date ? new Date(date) : new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('POST /transactions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/transactions
 * Retrieve all transactions, sorted by date descending.
 * Optional query params: limit (default 50), type, friend_name
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 50, type, friend_name } = req.query;

    const where = {};
    if (type) where.transaction_type = type;
    if (friend_name) where.friend_name = { contains: friend_name, mode: 'insensitive' };

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: parseInt(limit),
    });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error('GET /transactions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

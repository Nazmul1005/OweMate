const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * GET /api/friends
 * Returns a list of all friends with their net balance.
 *
 * netBalance > 0 → they owe me (I lent them money)
 * netBalance < 0 → I owe them (I borrowed from them)
 * netBalance = 0 → settled
 */
router.get('/', async (req, res) => {
  try {
    // Get all P2P transactions grouped by friend_name and transaction_type
    const p2pTransactions = await prisma.transaction.findMany({
      where: {
        transaction_type: { in: ['LENT_TO_FRIEND', 'BORROWED_FROM_FRIEND'] },
        friend_name: { not: null },
      },
      orderBy: { date: 'desc' },
    });

    // Group and calculate net balance per friend
    const friendMap = {};

    for (const tx of p2pTransactions) {
      const name = tx.friend_name;
      if (!friendMap[name]) {
        friendMap[name] = {
          friend_name: name,
          netBalance: 0,
          totalLent: 0,
          totalBorrowed: 0,
          transactionCount: 0,
          lastTransaction: tx.date,
        };
      }

      const friend = friendMap[name];
      friend.transactionCount++;

      if (tx.transaction_type === 'LENT_TO_FRIEND') {
        friend.totalLent += tx.amount;
        friend.netBalance += tx.amount;
      } else if (tx.transaction_type === 'BORROWED_FROM_FRIEND') {
        friend.totalBorrowed += tx.amount;
        friend.netBalance -= tx.amount;
      }

      // Keep track of most recent transaction date
      if (new Date(tx.date) > new Date(friend.lastTransaction)) {
        friend.lastTransaction = tx.date;
      }
    }

    // Convert to sorted array: unsettled first, then by abs(netBalance) desc
    const friends = Object.values(friendMap)
      .map((f) => ({
        ...f,
        netBalance: parseFloat(f.netBalance.toFixed(2)),
        totalLent: parseFloat(f.totalLent.toFixed(2)),
        totalBorrowed: parseFloat(f.totalBorrowed.toFixed(2)),
        status: f.netBalance > 0 ? 'OWES_ME' : f.netBalance < 0 ? 'I_OWE' : 'SETTLED',
      }))
      .sort((a, b) => {
        // Unsettled first
        if (a.status === 'SETTLED' && b.status !== 'SETTLED') return 1;
        if (a.status !== 'SETTLED' && b.status === 'SETTLED') return -1;
        // Then by absolute balance descending
        return Math.abs(b.netBalance) - Math.abs(a.netBalance);
      });

    return res.status(200).json({
      success: true,
      count: friends.length,
      data: friends,
    });
  } catch (error) {
    console.error('GET /friends error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/friends/:name/transactions
 * Get all transactions with a specific friend.
 */
router.get('/:name/transactions', async (req, res) => {
  try {
    const { name } = req.params;

    const transactions = await prisma.transaction.findMany({
      where: {
        friend_name: { equals: name, mode: 'insensitive' },
        transaction_type: { in: ['LENT_TO_FRIEND', 'BORROWED_FROM_FRIEND'] },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate net balance for this friend
    let netBalance = 0;
    let totalLent = 0;
    let totalBorrowed = 0;

    for (const tx of transactions) {
      if (tx.transaction_type === 'LENT_TO_FRIEND') {
        totalLent += tx.amount;
        netBalance += tx.amount;
      } else {
        totalBorrowed += tx.amount;
        netBalance -= tx.amount;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        friend_name: name,
        netBalance: parseFloat(netBalance.toFixed(2)),
        totalLent: parseFloat(totalLent.toFixed(2)),
        totalBorrowed: parseFloat(totalBorrowed.toFixed(2)),
        status: netBalance > 0 ? 'OWES_ME' : netBalance < 0 ? 'I_OWE' : 'SETTLED',
        transactions,
      },
    });
  } catch (error) {
    console.error('GET /friends/:name/transactions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

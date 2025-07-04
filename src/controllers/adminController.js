import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getFlaggedTransactions(req, res) {
  try {
    const flagged = await prisma.transaction.findMany({
      where: { isFlagged: true },
      orderBy: { timestamp: 'desc' }
    });

    res.status(200).json({ flagged });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch flagged transactions", error: err.message });
  }
}
export async function getTotalUserBalances(req, res) {
    try {
      const wallets = await prisma.wallet.findMany();
      const totals = {};
  
      for (const wallet of wallets) {
        const balances = wallet.balances || {};
        for (const [currency, amount] of Object.entries(balances)) {
          totals[currency] = (totals[currency] || 0) + amount;
        }
      }
  
      res.status(200).json({ totalBalances: totals });
    } catch (err) {
      res.status(500).json({ message: "Failed to aggregate balances", error: err.message });
    }
}
export async function getTopUsers(req, res) {
    try {
      const wallets = await prisma.wallet.findMany({ include: { user: true } });
  
      const topUsersPerCurrency = {};

      for (const wallet of wallets) {
        const balances = wallet.balances || {};
        const user = wallet.user;

        for (const [currency, amount] of Object.entries(balances)) {
          if (!topUsersPerCurrency[currency]) {
            topUsersPerCurrency[currency] = [];
          }

          topUsersPerCurrency[currency].push({ user, balance: amount });
        }
      }

      
      for (const currency in topUsersPerCurrency) {
        topUsersPerCurrency[currency].sort((a, b) => b.balance - a.balance);
        topUsersPerCurrency[currency] = topUsersPerCurrency[currency].slice(0, 5);
      }
      const txCounts = await prisma.transaction.groupBy({
        by: ['fromUserId'],
        _count: true,
        orderBy: {
          _count: {
            fromUserId: 'desc'
          }
        },
        take: 5
      });
      
  
      const topByTxVolume = await Promise.all(
        txCounts
          .filter(entry => entry.fromUserId !== null)
          .map(async (entry) => {
            const user = await prisma.user.findUnique({ where: { id: entry.fromUserId } });
            return {
              user,
              transactionCount: entry._count
            };
          })
      );
      
  
      res.status(200).json({
        topUsersByCurrency: topUsersPerCurrency,
        topUsersByTransactionVolume: topByTxVolume
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch top users", error: err.message });
    }
}
export async function softDeleteUser(req, res) {
  const { id } = req.params;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { isDeleted: true }
    });

    res.status(200).json({ message: `User ${id} soft-deleted`, user });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
}
export async function softDeleteTransaction(req, res) {
  const { id } = req.params;

  try {
    const tx = await prisma.transaction.update({
      where: { id },
      data: { isDeleted: true }
    });

    res.status(200).json({ message: `Transaction ${id} soft-deleted`, transaction: tx });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete transaction", error: err.message });
  }
}

  


  
  
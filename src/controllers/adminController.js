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
  
      const usersWithBalance = wallets.map(w => {
        const total = Object.values(w.balances || {}).reduce((a, b) => a + b, 0);
        return { user: w.user, totalBalance: total };
      }).sort((a, b) => b.totalBalance - a.totalBalance);
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
        topUsersByBalance: usersWithBalance.slice(0, 5),
        topUsersByTransactionVolume: topByTxVolume
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch top users", error: err.message });
    }
}
  


  
  
import { PrismaClient } from '@prisma/client';
import { sendMockEmail } from './emailService.js';

const prisma = new PrismaClient();

export async function detectAndFlagTransaction(tx) {
  const flags = [];
  if (tx.type === 'WITHDRAW' || tx.type === 'TRANSFER' && tx.amount >= 10000) {
    flags.push("Large withdrawal detected");
  }

  if (tx.type === 'TRANSFER') {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentTransfers = await prisma.transaction.findMany({
      where: {
        isDeleted: false,
        fromUserId: tx.fromUserId,
        type: 'TRANSFER',
        timestamp: { gte: oneMinuteAgo }
      }
    });

    if (recentTransfers.length >= 3) {
      flags.push("Multiple rapid transfers detected");
    }
  }

  if (flags.length > 0) {
    await prisma.transaction.update({
      where: { id: tx.id },
      data: {
        isFlagged: true,
        notes: flags.join('; ')
      }
    });
    const userId = tx.fromUserId || tx.toUserId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user) {
      await sendMockEmail(
        user.email,
        "Suspicious Activity Detected in Your Wallet",
        `A transaction of type ${tx.type} involving ${tx.amount} ${tx.currency} was flagged.\n\nReason(s): ${flags.join(', ')}\nIf this was not you, please contact support.`
      );
    }
  }
}

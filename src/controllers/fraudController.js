import { PrismaClient } from '@prisma/client';
import { detectAndFlagTransaction } from '../services/fraudDetection.js';

const prisma = new PrismaClient();

export async function scanAllTransactions(req, res) {
  try {
    const allTx = await prisma.transaction.findMany({
      where: { isFlagged: false }
    });

    for (const tx of allTx) {
      await detectAndFlagTransaction(tx);
    }

    res.json({ message: "Fraud scan completed" });
  } catch (err) {
    res.status(500).json({ message: "Fraud scan failed", error: err.message });
  }
}

import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { detectAndFlagTransaction } from '../services/fraudDetection.js';

const prisma = new PrismaClient();
export function startFraudScanJob() {
  cron.schedule('0 0 * * *', async () => {
    console.log(`Fraud Scan Job Started ${new Date().toLocaleString()}`);

    try {
      const transactions = await prisma.transaction.findMany({
        where: { isFlagged: false }
      });

      for (const tx of transactions) {
        await detectAndFlagTransaction(tx);
      }

      console.log(`Fraud scan completed — Checked ${transactions.length} transactions.`);
    } catch (err) {
      console.error('Error in fraud scan job:', err.message);
    }
  });
}

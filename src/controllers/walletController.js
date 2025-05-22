import { PrismaClient } from '@prisma/client';
import { detectAndFlagTransaction } from '../services/fraudDetection.js';
const prisma = new PrismaClient();

export async function deposit(req, res) {
    const { currency, amount } = req.body;
    const userId = req.user.id;
  
    if (!currency || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid deposit request" });
    }
  
    try {
      let wallet = await prisma.wallet.findUnique({ where: { userId } });
  
      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: {
            userId,
            balances: { [currency]: amount }
          }
        });
      } else {
        const currentBalances = wallet.balances || {};
        currentBalances[currency] = (currentBalances[currency] || 0) + amount;
  
        wallet = await prisma.wallet.update({
          where: { userId },
          data: { balances: currentBalances }
        });
      }
  
     
      const transaction = await prisma.transaction.create({
        data: {
          toUserId: userId,
          type: "DEPOSIT",
          currency,
          amount
        }
      });
      await detectAndFlagTransaction(transaction);
  
      res.status(200).json({
        message: `${amount} ${currency} deposited`,
        balances: wallet.balances
      });
  
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
}
  
export async function withdraw(req, res) {
    const { currency, amount } = req.body;
    const userId = req.user.id;
  
    if (!currency || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid withdraw request" });
    }
  
    try {
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
  
      if (!wallet || !wallet.balances || !wallet.balances[currency]) {
        return res.status(404).json({ message: `No balance found for ${currency}` });
      }
  
      if (wallet.balances[currency] < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
  
      const updatedBalances = {
        ...wallet.balances,
        [currency]: wallet.balances[currency] - amount
      };
  
      const updatedWallet = await prisma.wallet.update({
        where: { userId },
        data: { balances: updatedBalances }
      });
  
      
      const transaction = await prisma.transaction.create({
        data: {
          fromUserId: userId,
          type: "WITHDRAW",
          currency,
          amount
        }
      });
      await detectAndFlagTransaction(transaction);
      res.status(200).json({
        message: `${amount} ${currency} withdrawn`,
        balances: updatedWallet.balances
      });
  
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
}
export async function transfer(req, res) {
    const { recipientEmail, currency, amount } = req.body;
    const senderId = req.user.id;
  
    if (!recipientEmail || !currency || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid transfer request" });
    }
  
    try {
      
      const recipient = await prisma.user.findUnique({ where: { email: recipientEmail } });
      if (!recipient || recipient.id === senderId) {
        return res.status(400).json({ message: "Invalid recipient" });
      }
  
      const senderWallet = await prisma.wallet.findUnique({ where: { userId: senderId } });
      if (!senderWallet || !senderWallet.balances[currency] || senderWallet.balances[currency] < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
  
      let recipientWallet = await prisma.wallet.findUnique({ where: { userId: recipient.id } });
      if (!recipientWallet) {
        recipientWallet = await prisma.wallet.create({
          data: {
            userId: recipient.id,
            balances: { [currency]: amount }
          }
        });
      } else {
        const recipientBalances = recipientWallet.balances;
        recipientBalances[currency] = (recipientBalances[currency] || 0) + amount;
        await prisma.wallet.update({
          where: { userId: recipient.id },
          data: { balances: recipientBalances }
        });
      }
  
      const updatedSenderBalances = {
        ...senderWallet.balances,
        [currency]: senderWallet.balances[currency] - amount
      };
      await prisma.wallet.update({
        where: { userId: senderId },
        data: { balances: updatedSenderBalances }
      });
  
      const transaction = await prisma.transaction.create({
        data: {
          fromUserId: senderId,
          toUserId: recipient.id,
          type: "TRANSFER",
          currency,
          amount
        }
      });
      await detectAndFlagTransaction(transaction);
      res.status(200).json({
        message: `Transferred ${amount} ${currency} to ${recipientEmail}`,
        balances: updatedSenderBalances
      });
  
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
}
  
  

export async function getAllBalances(req, res) {
    const userId = req.user.id;
  
    try {
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
  
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
  
      res.json({ balances: wallet.balances });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
}
export async function getBalanceByCurrency(req, res) {
    const userId = req.user.id;
    const currency = req.params.currency;
  
    try {
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
  
      if (!wallet || !wallet.balances || wallet.balances[currency] === undefined) {
        return res.status(404).json({ message: `No balance found for ${currency}` });
      }
  
      res.json({ currency, balance: wallet.balances[currency] });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
}

export async function getTransactions(req, res) {
  const userId = req.user.id;

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    res.status(200).json({ transactions });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch transactions", error: err.message });
  }
}

  
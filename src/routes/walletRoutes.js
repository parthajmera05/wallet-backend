import express from 'express';
import { deposit, getAllBalances, getBalanceByCurrency, withdraw, getTransactions} from '../controllers/walletController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/deposit', authenticateJWT, deposit);
router.post('/withdraw', authenticateJWT, withdraw);
router.get('/balances', authenticateJWT, getAllBalances);
router.get('/balance/:currency', authenticateJWT, getBalanceByCurrency);
router.get('/transactions', authenticateJWT, getTransactions);

export default router;

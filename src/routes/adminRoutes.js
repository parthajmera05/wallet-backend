import express from 'express';
import { getFlaggedTransactions, getTotalUserBalances, getTopUsers } from '../controllers/adminController.js';
import { adminRegister, adminLogin } from '../controllers/adminAuthController.js';
import { authenticateAdmin } from '../middlewares/authAdminMiddleware.js';

const router = express.Router();


router.post('/register', adminRegister);
router.post('/login', adminLogin);
router.get('/flagged-transactions', authenticateAdmin, getFlaggedTransactions);
router.get('/total-balances', authenticateAdmin, getTotalUserBalances);
router.get('/top-users', authenticateAdmin, getTopUsers);

export default router;

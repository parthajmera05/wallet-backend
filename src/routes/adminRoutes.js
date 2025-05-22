import express from 'express';
import { getFlaggedTransactions, getTotalUserBalances, getTopUsers, softDeleteUser, softDeleteTransaction } from '../controllers/adminController.js';
import { adminRegister, adminLogin } from '../controllers/adminAuthController.js';
import { authenticateAdmin } from '../middlewares/authAdminMiddleware.js';


const router = express.Router();


router.post('/register', adminRegister);
router.post('/login', adminLogin);
router.get('/flagged-transactions', authenticateAdmin, getFlaggedTransactions);
router.get('/total-balances', authenticateAdmin, getTotalUserBalances);
router.get('/top-users', authenticateAdmin, getTopUsers);
router.delete('/user/:id', authenticateAdmin, softDeleteUser);
router.delete('/transaction/:id', authenticateAdmin, softDeleteTransaction);

export default router;

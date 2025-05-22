import express from 'express';
import { scanAllTransactions } from '../controllers/fraudController.js';
import { authenticateAdmin } from '../middlewares/authAdminMiddleware.js';

const router = express.Router();


router.get('/scan', authenticateAdmin, scanAllTransactions);

export default router;
import express from 'express';
import * as saleController from '../controllers/sale.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/sales', authenticateToken, saleController.getSales);
router.get('/sales/:id', authenticateToken, saleController.getSaleById);

router.post('/sales', authenticateToken, requireAdmin, saleController.sellBook);
router.post('/sales/checkout', authenticateToken, requireAdmin, saleController.checkoutSale);

export default router;

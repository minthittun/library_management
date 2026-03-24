import express from 'express';
import * as saleController from '../controllers/sale.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/sales', authenticateToken, saleController.getSales);
router.get('/sales/:id', authenticateToken, saleController.getSaleById);

router.post('/sales', authenticateToken, saleController.sellBook);
router.post('/sales/checkout', authenticateToken, saleController.checkoutSale);

export default router;

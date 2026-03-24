import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/payments', authenticateToken, paymentController.getPayments);
router.get('/member/:memberId/payments', authenticateToken, paymentController.getMemberPayments);

router.post('/payments', authenticateToken, paymentController.createPayment);

export default router;

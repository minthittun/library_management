import express from 'express';
import * as borrowController from '../controllers/borrow.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/borrow', authenticateToken, borrowController.getBorrowRecords);
router.get('/borrow/:id', authenticateToken, borrowController.getBorrowRecordById);
router.get('/member/:memberId/borrow-history', authenticateToken, borrowController.getMemberBorrowHistory);

router.post('/borrow', authenticateToken, borrowController.borrowBook);
router.post('/return/:id', authenticateToken, borrowController.returnBook);

export default router;

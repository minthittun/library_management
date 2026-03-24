import express from 'express';
import * as borrowController from '../controllers/borrow.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/borrow', authenticateToken, borrowController.getBorrowRecords);
router.get('/borrow/:id', authenticateToken, borrowController.getBorrowRecordById);
router.get('/member/:memberId/borrow-history', authenticateToken, borrowController.getMemberBorrowHistory);

router.post('/borrow', authenticateToken, requireAdmin, borrowController.borrowBook);
router.post('/return/bulk', authenticateToken, requireAdmin, borrowController.returnBooks);
router.post('/return/:id', authenticateToken, requireAdmin, borrowController.returnBook);

export default router;

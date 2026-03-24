import express from 'express';
import * as bookController from '../controllers/book.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/books', authenticateToken, bookController.getBooks);
router.get('/books/:id', authenticateToken, bookController.getBookById);

router.post('/books', authenticateToken, requireAdmin, bookController.createBook);
router.put('/books/:id', authenticateToken, requireAdmin, bookController.updateBook);
router.delete('/books/:id', authenticateToken, requireAdmin, bookController.deleteBook);

router.post('/book-copies', authenticateToken, requireAdmin, bookController.createBookCopy);
router.get('/book-copies', authenticateToken, bookController.getBookCopies);
router.get('/available-copies', authenticateToken, bookController.getAvailableCopies);
router.put('/book-copies/bulk', authenticateToken, requireAdmin, bookController.bulkUpdateBookCopies);
router.delete('/book-copies/bulk', authenticateToken, requireAdmin, bookController.bulkDeleteBookCopies);

export default router;

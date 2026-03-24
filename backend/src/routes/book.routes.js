import express from 'express';
import * as bookController from '../controllers/book.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/books', bookController.getBooks);
router.get('/books/:id', bookController.getBookById);

router.post('/books', authenticateToken, bookController.createBook);
router.put('/books/:id', authenticateToken, bookController.updateBook);
router.delete('/books/:id', authenticateToken, bookController.deleteBook);

router.post('/book-copies', authenticateToken, bookController.createBookCopy);
router.get('/book-copies', authenticateToken, bookController.getBookCopies);
router.get('/available-copies', authenticateToken, bookController.getAvailableCopies);

export default router;

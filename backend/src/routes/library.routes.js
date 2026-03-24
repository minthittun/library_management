import express from 'express';
import * as libraryController from '../controllers/library.controller.js';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/libraries', authenticateToken, libraryController.getLibraries);
router.get('/libraries/:id', authenticateToken, libraryController.getLibraryById);

router.post('/libraries', authenticateToken, requireSuperAdmin, libraryController.createLibrary);
router.put('/libraries/:id', authenticateToken, requireSuperAdmin, libraryController.updateLibrary);
router.delete('/libraries/:id', authenticateToken, requireSuperAdmin, libraryController.deleteLibrary);

export default router;

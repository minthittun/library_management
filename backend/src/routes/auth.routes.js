import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/users', authenticateToken, requireSuperAdmin, authController.getUsers);
router.get('/auth/users/:id', authenticateToken, requireSuperAdmin, authController.getUserById);
router.post('/auth/users', authenticateToken, requireSuperAdmin, authController.createUser);
router.put('/auth/users/:id', authenticateToken, requireSuperAdmin, authController.updateUser);
router.delete('/auth/users/:id', authenticateToken, requireSuperAdmin, authController.deleteUser);
router.get('/auth/me', authenticateToken, authController.getMe);

export default router;

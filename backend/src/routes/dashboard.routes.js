import express from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', authenticateToken, dashboardController.getDashboardStats);
router.get('/superadmin/dashboard', authenticateToken, requireSuperAdmin, dashboardController.getSuperAdminDashboardStats);

export default router;

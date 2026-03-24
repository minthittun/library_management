import express from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', authenticateToken, dashboardController.getDashboardStats);

export default router;

import express from 'express';
import * as memberController from '../controllers/member.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/members', authenticateToken, memberController.getMembers);
router.get('/members/:id', authenticateToken, memberController.getMemberById);
router.get('/members/:id/check', authenticateToken, memberController.checkMembership);

router.post('/members', authenticateToken, requireAdmin, memberController.createMember);
router.put('/members/:id', authenticateToken, requireAdmin, memberController.updateMember);

export default router;

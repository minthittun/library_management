import express from 'express';
import * as memberController from '../controllers/member.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/members', authenticateToken, memberController.getMembers);
router.get('/members/:id', authenticateToken, memberController.getMemberById);
router.get('/members/:id/check', authenticateToken, memberController.checkMembership);

router.post('/members', authenticateToken, memberController.createMember);
router.put('/members/:id', authenticateToken, memberController.updateMember);

export default router;

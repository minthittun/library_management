import express from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/librarians', authController.getLibrarians);

export default router;

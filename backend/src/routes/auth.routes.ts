/**
 * Authentication Routes
 */

import { Router } from 'express';
import { register, login, getProfile, refreshToken, updateProfile, changePassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/refresh', authenticate, refreshToken);
router.post('/change-password', authenticate, changePassword);

export default router;

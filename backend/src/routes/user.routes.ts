/**
 * User Routes
 */

import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', authorize('ADMIN'), getUsers);
router.post('/', authorize('ADMIN'), createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);

export default router;

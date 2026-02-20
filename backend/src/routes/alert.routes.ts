/**
 * Alert Routes
 */

import { Router } from 'express';
import {
  getAlerts,
  getAlertById,
  createAlert,
  updateAlertStatus,
  assignAlert,
  getAlertStats
} from '../controllers/alert.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAlerts);
router.get('/stats', getAlertStats);
router.post('/', createAlert);
router.get('/:id', getAlertById);
router.put('/:id/status', updateAlertStatus);
router.put('/:id/assign', assignAlert);

export default router;

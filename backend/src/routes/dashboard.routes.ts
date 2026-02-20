/**
 * Dashboard Routes
 */

import { Router } from 'express';
import {
  getOverviewStats,
  getFarmDashboard,
  getParkDashboard,
  getLandDashboard
} from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/overview', getOverviewStats);
router.get('/farm', getFarmDashboard);
router.get('/park', getParkDashboard);
router.get('/land', getLandDashboard);

export default router;

/**
 * Report Routes
 */

import { Router } from 'express';
import {
  getReports,
  getReportById,
  generateReport
} from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getReports);
router.post('/', generateReport);
router.get('/:id', getReportById);

export default router;

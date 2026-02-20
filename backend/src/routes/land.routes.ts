/**
 * Land Routes
 */

import { Router } from 'express';
import {
  getLandZones,
  getLandZoneById,
  createLandZone,
  getSurveys,
  createSurvey,
  getChanges,
  createChange
} from '../controllers/land.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Land zone routes
router.get('/zones', getLandZones);
router.post('/zones', createLandZone);
router.get('/zones/:id', getLandZoneById);

// Survey routes
router.get('/zones/:zoneId/surveys', getSurveys);
router.post('/zones/:zoneId/surveys', createSurvey);

// Change routes
router.get('/zones/:zoneId/changes', getChanges);
router.post('/zones/:zoneId/changes', createChange);

export default router;

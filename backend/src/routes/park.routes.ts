/**
 * Park Routes
 */

import { Router } from 'express';
import {
  getParks,
  getParkById,
  createPark,
  getWildlife,
  getPatrols,
  createPatrol,
  getIncidents,
  createIncident
} from '../controllers/park.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Park routes
router.get('/', getParks);
router.post('/', createPark);
router.get('/:id', getParkById);

// Wildlife routes
router.get('/:parkId/wildlife', getWildlife);

// Patrol routes
router.get('/:parkId/patrols', getPatrols);
router.post('/:parkId/patrols', createPatrol);

// Incident routes
router.get('/:parkId/incidents', getIncidents);
router.post('/:parkId/incidents', createIncident);

export default router;

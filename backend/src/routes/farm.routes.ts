/**
 * Farm Routes
 */

import { Router } from 'express';
import {
  getFarms,
  getFarmById,
  createFarm,
  getHerds,
  createHerd,
  getAnimals,
  getAnimalById,
  getPastureZones
} from '../controllers/farm.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Farm routes
router.get('/', getFarms);
router.post('/', createFarm);
router.get('/:id', getFarmById);

// Herd routes
router.get('/:farmId/herds', getHerds);
router.post('/:farmId/herds', createHerd);

// Animal routes
router.get('/herds/:herdId/animals', getAnimals);
router.get('/animals/:id', getAnimalById);

// Pasture routes
router.get('/:farmId/pastures', getPastureZones);

export default router;

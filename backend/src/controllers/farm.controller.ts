/**
 * Farm Controller
 * Handles KUBE-Farm module operations
 */

import { Request, Response } from 'express';
import prisma from '../utils/db';

/**
 * Get all farms for current user
 */
export const getFarms = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const farms = await prisma.farm.findMany({
      where: {
        ...(req.user?.role !== 'ADMIN' && { ownerId: userId })
      },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        herds: {
          select: {
            id: true,
            name: true,
            totalCount: true,
            status: true
          }
        },
        _count: {
          select: { herds: true, pastureZones: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { farms }
    });
  } catch (error) {
    console.error('Get farms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get farms'
    });
  }
};

/**
 * Get single farm by ID
 */
export const getFarmById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const farm = await prisma.farm.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        herds: {
          include: {
            animals: {
              select: { id: true, tagId: true, status: true }
            }
          }
        },
        pastureZones: true,
        alerts: {
          where: { status: { not: 'RESOLVED' } },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    res.json({
      success: true,
      data: { farm }
    });
  } catch (error) {
    console.error('Get farm error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get farm'
    });
  }
};

/**
 * Create a new farm
 */
export const createFarm = async (req: Request, res: Response) => {
  try {
    const { name, description, location, latitude, longitude, area } = req.body;
    const ownerId = req.user?.id;

    if (!name || !location || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const farm = await prisma.farm.create({
      data: {
        name,
        description,
        location,
        latitude,
        longitude,
        area: area || 0,
        ownerId: ownerId!
      },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Farm created successfully',
      data: { farm }
    });
  } catch (error) {
    console.error('Create farm error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create farm'
    });
  }
};

/**
 * Get all herds for a farm
 */
export const getHerds = async (req: Request, res: Response) => {
  try {
    const { farmId } = req.params;

    const herds = await prisma.herd.findMany({
      where: { farmId },
      include: {
        animals: {
          select: {
            id: true,
            tagId: true,
            name: true,
            status: true,
            lastSeenAt: true
          }
        },
        telemetry: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { herds }
    });
  } catch (error) {
    console.error('Get herds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get herds'
    });
  }
};

/**
 * Create a new herd
 */
export const createHerd = async (req: Request, res: Response) => {
  try {
    const { farmId } = req.params;
    const { name, description, animalType, totalCount } = req.body;

    if (!name || !animalType || !totalCount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const herd = await prisma.herd.create({
      data: {
        name,
        description,
        animalType,
        totalCount,
        healthyCount: totalCount,
        sickCount: 0,
        missingCount: 0,
        farmId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Herd created successfully',
      data: { herd }
    });
  } catch (error) {
    console.error('Create herd error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create herd'
    });
  }
};

/**
 * Get animals in a herd
 */
export const getAnimals = async (req: Request, res: Response) => {
  try {
    const { herdId } = req.params;

    const animals = await prisma.animal.findMany({
      where: { herdId },
      include: {
        healthEvents: {
          orderBy: { detectedAt: 'desc' },
          take: 5
        },
        telemetry: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { animals }
    });
  } catch (error) {
    console.error('Get animals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get animals'
    });
  }
};

/**
 * Get single animal details
 */
export const getAnimalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const animal = await prisma.animal.findUnique({
      where: { id },
      include: {
        herd: {
          include: {
            farm: {
              select: { id: true, name: true }
            }
          }
        },
        healthEvents: {
          orderBy: { detectedAt: 'desc' }
        },
        telemetry: {
          orderBy: { timestamp: 'desc' },
          take: 50
        }
      }
    });

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found'
      });
    }

    res.json({
      success: true,
      data: { animal }
    });
  } catch (error) {
    console.error('Get animal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get animal'
    });
  }
};

/**
 * Get pasture zones for a farm
 */
export const getPastureZones = async (req: Request, res: Response) => {
  try {
    const { farmId } = req.params;

    const zones = await prisma.pastureZone.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { zones }
    });
  } catch (error) {
    console.error('Get pasture zones error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pasture zones'
    });
  }
};

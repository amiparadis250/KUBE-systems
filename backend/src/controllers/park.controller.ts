/**
 * Park Controller
 * Handles KUBE-Park module operations
 */

import { Request, Response } from 'express';
import prisma from '../utils/db';

/**
 * Get all parks
 */
export const getParks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const parks = await prisma.park.findMany({
      where: {
        ...(req.user?.role !== 'ADMIN' && { managerId: userId })
      },
      include: {
        manager: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        wildlife: {
          select: { id: true, species: true, estimatedCount: true }
        },
        _count: {
          select: { zones: true, patrols: true, incidents: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { parks }
    });
  } catch (error) {
    console.error('Get parks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get parks'
    });
  }
};

/**
 * Get single park by ID
 */
export const getParkById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const park = await prisma.park.findUnique({
      where: { id },
      include: {
        manager: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        zones: true,
        wildlife: {
          include: {
            sightings: {
              orderBy: { timestamp: 'desc' },
              take: 10
            }
          }
        },
        patrols: {
          orderBy: { scheduledStart: 'desc' },
          take: 10
        },
        incidents: {
          where: { status: { not: 'resolved' } },
          orderBy: { reportedAt: 'desc' }
        }
      }
    });

    if (!park) {
      return res.status(404).json({
        success: false,
        message: 'Park not found'
      });
    }

    res.json({
      success: true,
      data: { park }
    });
  } catch (error) {
    console.error('Get park error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get park'
    });
  }
};

/**
 * Create a new park
 */
export const createPark = async (req: Request, res: Response) => {
  try {
    const { name, description, parkType, location, latitude, longitude, area } = req.body;
    const managerId = req.user?.id;

    if (!name || !parkType || !location || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const park = await prisma.park.create({
      data: {
        name,
        description,
        parkType,
        location,
        latitude,
        longitude,
        area: area || 0,
        managerId: managerId!
      },
      include: {
        manager: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Park created successfully',
      data: { park }
    });
  } catch (error) {
    console.error('Create park error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create park'
    });
  }
};

/**
 * Get wildlife populations for a park
 */
export const getWildlife = async (req: Request, res: Response) => {
  try {
    const { parkId } = req.params;

    const wildlife = await prisma.wildlifePopulation.findMany({
      where: { parkId },
      include: {
        sightings: {
          orderBy: { timestamp: 'desc' },
          take: 5
        }
      },
      orderBy: { species: 'asc' }
    });

    res.json({
      success: true,
      data: { wildlife }
    });
  } catch (error) {
    console.error('Get wildlife error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wildlife'
    });
  }
};

/**
 * Get patrols for a park
 */
export const getPatrols = async (req: Request, res: Response) => {
  try {
    const { parkId } = req.params;

    const patrols = await prisma.patrol.findMany({
      where: { parkId },
      include: {
        incidents: true
      },
      orderBy: { scheduledStart: 'desc' }
    });

    res.json({
      success: true,
      data: { patrols }
    });
  } catch (error) {
    console.error('Get patrols error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get patrols'
    });
  }
};

/**
 * Create a new patrol
 */
export const createPatrol = async (req: Request, res: Response) => {
  try {
    const { parkId } = req.params;
    const { name, patrolType, routeCoordinates, scheduledStart, scheduledEnd, rangers } = req.body;

    if (!name || !patrolType || !scheduledStart || !scheduledEnd) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const patrol = await prisma.patrol.create({
      data: {
        parkId,
        name,
        patrolType,
        routeCoordinates: typeof routeCoordinates === 'string' ? routeCoordinates : JSON.stringify(routeCoordinates || {}),
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: new Date(scheduledEnd),
        rangers: typeof rangers === 'string' ? rangers : JSON.stringify(rangers || [])
      }
    });

    res.status(201).json({
      success: true,
      message: 'Patrol created successfully',
      data: { patrol }
    });
  } catch (error) {
    console.error('Create patrol error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create patrol'
    });
  }
};

/**
 * Get incidents for a park
 */
export const getIncidents = async (req: Request, res: Response) => {
  try {
    const { parkId } = req.params;

    const incidents = await prisma.incident.findMany({
      where: { parkId },
      orderBy: { reportedAt: 'desc' }
    });

    res.json({
      success: true,
      data: { incidents }
    });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get incidents'
    });
  }
};

/**
 * Create a new incident
 */
export const createIncident = async (req: Request, res: Response) => {
  try {
    const { parkId } = req.params;
    const { type, severity, title, description, latitude, longitude, location, evidenceUrls } = req.body;

    if (!type || !severity || !title || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const incident = await prisma.incident.create({
      data: {
        parkId,
        type,
        severity,
        title,
        description,
        latitude,
        longitude,
        location,
        status: 'reported',
        evidenceUrls: typeof evidenceUrls === 'string' ? evidenceUrls : JSON.stringify(evidenceUrls || [])
      }
    });

    res.status(201).json({
      success: true,
      message: 'Incident reported successfully',
      data: { incident }
    });
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report incident'
    });
  }
};

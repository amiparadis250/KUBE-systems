/**
 * Alert Controller
 * Handles system-wide alerts
 */

import { Request, Response } from 'express';
import prisma from '../utils/db';

/**
 * Get all alerts
 */
export const getAlerts = async (req: Request, res: Response) => {
  try {
    const { status, type, severity, module } = req.query;
    const userId = req.user?.id;

    const alerts = await prisma.alert.findMany({
      where: {
        ...(status && { status: String(status) as any }),
        ...(type && { type: String(type) as any }),
        ...(severity && { severity: String(severity) as any }),
        ...(module && { module: String(module) }),
        ...(req.user?.role !== 'ADMIN' && {
          OR: [
            { assignedToId: userId },
            { farm: { ownerId: userId } }
          ]
        })
      },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        farm: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 100
    });

    res.json({
      success: true,
      data: { alerts }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alerts'
    });
  }
};

/**
 * Get single alert by ID
 */
export const getAlertById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        farm: {
          select: { id: true, name: true }
        }
      }
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: { alert }
    });
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alert'
    });
  }
};

/**
 * Create a new alert
 */
export const createAlert = async (req: Request, res: Response) => {
  try {
    const { type, severity, title, message, details, module, entityType, entityId, latitude, longitude, location, farmId } = req.body;

    if (!type || !severity || !title || !message || !module) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const alert = await prisma.alert.create({
      data: {
        type,
        severity,
        title,
        message,
        details,
        module,
        entityType,
        entityId,
        latitude,
        longitude,
        location,
        farmId
      }
    });

    // TODO: Trigger real-time notification via Socket.IO

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: { alert }
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create alert'
    });
  }
};

/**
 * Update alert status
 */
export const updateAlertStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, actionTaken } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        status,
        actionTaken,
        ...(status === 'RESOLVED' && {
          resolvedBy: req.user?.id,
          resolvedAt: new Date()
        })
      }
    });

    res.json({
      success: true,
      message: 'Alert updated successfully',
      data: { alert }
    });
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert'
    });
  }
};

/**
 * Assign alert to user
 */
export const assignAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assignedToId } = req.body;

    if (!assignedToId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        assignedToId,
        status: 'ACKNOWLEDGED'
      },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Alert assigned successfully',
      data: { alert }
    });
  } catch (error) {
    console.error('Assign alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign alert'
    });
  }
};

/**
 * Get alert statistics
 */
export const getAlertStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const [total, newAlerts, acknowledged, inProgress, resolved] = await Promise.all([
      prisma.alert.count({
        where: req.user?.role !== 'ADMIN' ? { assignedToId: userId } : undefined
      }),
      prisma.alert.count({
        where: {
          status: 'NEW',
          ...(req.user?.role !== 'ADMIN' && { assignedToId: userId })
        }
      }),
      prisma.alert.count({
        where: {
          status: 'ACKNOWLEDGED',
          ...(req.user?.role !== 'ADMIN' && { assignedToId: userId })
        }
      }),
      prisma.alert.count({
        where: {
          status: 'IN_PROGRESS',
          ...(req.user?.role !== 'ADMIN' && { assignedToId: userId })
        }
      }),
      prisma.alert.count({
        where: {
          status: 'RESOLVED',
          ...(req.user?.role !== 'ADMIN' && { assignedToId: userId })
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          total,
          new: newAlerts,
          acknowledged,
          inProgress,
          resolved
        }
      }
    });
  } catch (error) {
    console.error('Get alert stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alert statistics'
    });
  }
};

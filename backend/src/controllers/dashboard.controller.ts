/**
 * Dashboard Controller
 * Provides aggregated data and statistics for the main dashboard
 */

import { Request, Response } from 'express';
import prisma from '../utils/db';

/**
 * Get overall statistics
 */
export const getOverviewStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    const [
      farmsCount,
      herdsCount,
      animalsCount,
      parksCount,
      wildlifeCount,
      landZonesCount,
      activeAlerts,
      recentActivities
    ] = await Promise.all([
      // Farms
      prisma.farm.count({
        where: !isAdmin ? { ownerId: userId } : undefined
      }),

      // Herds
      prisma.herd.count({
        where: !isAdmin ? { farm: { ownerId: userId } } : undefined
      }),

      // Animals
      prisma.animal.count({
        where: !isAdmin ? { herd: { farm: { ownerId: userId } } } : undefined
      }),

      // Parks
      prisma.park.count({
        where: !isAdmin ? { managerId: userId } : undefined
      }),

      // Wildlife populations
      prisma.wildlifePopulation.count({
        where: !isAdmin ? { park: { managerId: userId } } : undefined
      }),

      // Land zones
      prisma.landZone.count(),

      // Active alerts
      prisma.alert.count({
        where: {
          status: { not: 'RESOLVED' },
          ...(!isAdmin && { assignedToId: userId })
        }
      }),

      // Recent activities
      prisma.activity.findMany({
        where: !isAdmin ? { userId } : undefined,
        orderBy: { timestamp: 'desc' },
        take: 10,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          farms: farmsCount,
          herds: herdsCount,
          animals: animalsCount,
          parks: parksCount,
          wildlife: wildlifeCount,
          landZones: landZonesCount,
          activeAlerts
        },
        recentActivities
      }
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get overview statistics'
    });
  }
};

/**
 * Get KUBE-Farm dashboard data
 */
export const getFarmDashboard = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    const [
      totalAnimals,
      healthyAnimals,
      sickAnimals,
      missingAnimals,
      herds,
      recentAlerts,
      healthTrend
    ] = await Promise.all([
      // Total animals
      prisma.animal.count({
        where: !isAdmin ? { herd: { farm: { ownerId: userId } } } : undefined
      }),

      // Healthy animals
      prisma.animal.count({
        where: {
          status: 'HEALTHY',
          ...(!isAdmin && { herd: { farm: { ownerId: userId } } })
        }
      }),

      // Sick animals
      prisma.animal.count({
        where: {
          status: 'SICK',
          ...(!isAdmin && { herd: { farm: { ownerId: userId } } })
        }
      }),

      // Missing animals
      prisma.animal.count({
        where: {
          status: 'MISSING',
          ...(!isAdmin && { herd: { farm: { ownerId: userId } } })
        }
      }),

      // Herds with details
      prisma.herd.findMany({
        where: !isAdmin ? { farm: { ownerId: userId } } : undefined,
        include: {
          farm: {
            select: { id: true, name: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
      }),

      // Recent alerts
      prisma.alert.findMany({
        where: {
          module: 'farm',
          status: { not: 'RESOLVED' },
          ...(!isAdmin && { farm: { ownerId: userId } })
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      // Health trend (last 7 days)
      prisma.healthEvent.groupBy({
        by: ['type'],
        _count: true,
        where: {
          detectedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          },
          ...(!isAdmin && { animal: { herd: { farm: { ownerId: userId } } } })
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalAnimals,
          healthyAnimals,
          sickAnimals,
          missingAnimals,
          healthRate: totalAnimals > 0 ? ((healthyAnimals / totalAnimals) * 100).toFixed(1) : '0'
        },
        herds,
        recentAlerts,
        healthTrend
      }
    });
  } catch (error) {
    console.error('Get farm dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get farm dashboard data'
    });
  }
};

/**
 * Get KUBE-Park dashboard data
 */
export const getParkDashboard = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    const [
      parksCount,
      wildlifeSpecies,
      activePatrols,
      recentIncidents,
      wildlifePopulations,
      censusData
    ] = await Promise.all([
      // Total parks
      prisma.park.count({
        where: !isAdmin ? { managerId: userId } : undefined
      }),

      // Wildlife species count
      prisma.wildlifePopulation.count({
        where: !isAdmin ? { park: { managerId: userId } } : undefined
      }),

      // Active patrols
      prisma.patrol.count({
        where: {
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          ...(!isAdmin && { park: { managerId: userId } })
        }
      }),

      // Recent incidents
      prisma.incident.findMany({
        where: {
          status: { not: 'resolved' },
          ...(!isAdmin && { park: { managerId: userId } })
        },
        orderBy: { reportedAt: 'desc' },
        take: 5,
        include: {
          park: {
            select: { id: true, name: true }
          }
        }
      }),

      // Wildlife populations
      prisma.wildlifePopulation.findMany({
        where: !isAdmin ? { park: { managerId: userId } } : undefined,
        orderBy: { estimatedCount: 'desc' },
        take: 10
      }),

      // Recent census data
      prisma.wildlifeSighting.groupBy({
        by: ['populationId'],
        _sum: {
          count: true
        },
        where: {
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          parks: parksCount,
          wildlifeSpecies,
          activePatrols,
          incidentsCount: recentIncidents.length
        },
        recentIncidents,
        wildlifePopulations,
        censusData
      }
    });
  } catch (error) {
    console.error('Get park dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get park dashboard data'
    });
  }
};

/**
 * Get KUBE-Land dashboard data
 */
export const getLandDashboard = async (req: Request, res: Response) => {
  try {
    const [
      totalZones,
      healthyZones,
      degradedZones,
      recentChanges,
      vegetationTrend,
      zones
    ] = await Promise.all([
      // Total zones
      prisma.landZone.count(),

      // Healthy zones (degradation < 30)
      prisma.landZone.count({
        where: {
          degradationLevel: {
            lt: 30
          }
        }
      }),

      // Degraded zones (degradation >= 60)
      prisma.landZone.count({
        where: {
          degradationLevel: {
            gte: 60
          }
        }
      }),

      // Recent changes
      prisma.landChange.findMany({
        orderBy: { detectedAt: 'desc' },
        take: 5,
        include: {
          zone: {
            select: { id: true, name: true, region: true }
          }
        }
      }),

      // Vegetation trend (last 12 months)
      prisma.landSurvey.groupBy({
        by: ['zoneId'],
        _avg: {
          ndvi: true,
          healthScore: true
        },
        where: {
          surveyDate: {
            gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // All zones with latest survey
      prisma.landZone.findMany({
        include: {
          surveys: {
            orderBy: { surveyDate: 'desc' },
            take: 1
          }
        },
        take: 20
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalZones,
          healthyZones,
          degradedZones,
          healthRate: totalZones > 0 ? ((healthyZones / totalZones) * 100).toFixed(1) : '0'
        },
        recentChanges,
        vegetationTrend,
        zones
      }
    });
  } catch (error) {
    console.error('Get land dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get land dashboard data'
    });
  }
};

/**
 * Land Controller
 * Handles KUBE-Land module operations
 */

import { Request, Response } from 'express';
import prisma from '../utils/db';

/**
 * Get all land zones
 */
export const getLandZones = async (req: Request, res: Response) => {
  try {
    const { region, district } = req.query;

    const zones = await prisma.landZone.findMany({
      where: {
        ...(region && { region: String(region) }),
        ...(district && { district: String(district) })
      },
      include: {
        surveys: {
          orderBy: { surveyDate: 'desc' },
          take: 1
        },
        changes: {
          orderBy: { detectedAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { zones }
    });
  } catch (error) {
    console.error('Get land zones error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get land zones'
    });
  }
};

/**
 * Get single land zone by ID
 */
export const getLandZoneById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const zone = await prisma.landZone.findUnique({
      where: { id },
      include: {
        surveys: {
          orderBy: { surveyDate: 'desc' }
        },
        changes: {
          orderBy: { detectedAt: 'desc' }
        }
      }
    });

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Land zone not found'
      });
    }

    res.json({
      success: true,
      data: { zone }
    });
  } catch (error) {
    console.error('Get land zone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get land zone'
    });
  }
};

/**
 * Create a new land zone
 */
export const createLandZone = async (req: Request, res: Response) => {
  try {
    const { name, description, coordinates, area, region, district, landUseType, ownership } = req.body;

    if (!name || !coordinates || !area || !region || !landUseType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const zone = await prisma.landZone.create({
      data: {
        name,
        description,
        coordinates: typeof coordinates === 'string' ? coordinates : JSON.stringify(coordinates),
        area,
        region,
        district,
        landUseType,
        ownership
      }
    });

    res.status(201).json({
      success: true,
      message: 'Land zone created successfully',
      data: { zone }
    });
  } catch (error) {
    console.error('Create land zone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create land zone'
    });
  }
};

/**
 * Get surveys for a land zone
 */
export const getSurveys = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;

    const surveys = await prisma.landSurvey.findMany({
      where: { zoneId },
      orderBy: { surveyDate: 'desc' }
    });

    res.json({
      success: true,
      data: { surveys }
    });
  } catch (error) {
    console.error('Get surveys error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get surveys'
    });
  }
};

/**
 * Create a new land survey
 */
export const createSurvey = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    const { surveyType, ndvi, biomass, treeCanopyCover, bareGround, waterBodies, healthScore, surveyDate } = req.body;

    if (!surveyType || !surveyDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const survey = await prisma.landSurvey.create({
      data: {
        zoneId,
        surveyType,
        ndvi,
        biomass,
        treeCanopyCover,
        bareGround,
        waterBodies,
        healthScore,
        surveyDate: new Date(surveyDate)
      }
    });

    res.status(201).json({
      success: true,
      message: 'Survey created successfully',
      data: { survey }
    });
  } catch (error) {
    console.error('Create survey error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create survey'
    });
  }
};

/**
 * Get land changes for a zone
 */
export const getChanges = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;

    const changes = await prisma.landChange.findMany({
      where: { zoneId },
      orderBy: { detectedAt: 'desc' }
    });

    res.json({
      success: true,
      data: { changes }
    });
  } catch (error) {
    console.error('Get changes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get changes'
    });
  }
};

/**
 * Report a new land change
 */
export const createChange = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    const { changeType, severity, beforeImageUrl, afterImageUrl, affectedArea, impactDescription, causesIdentified, recommendedAction, detectedAt } = req.body;

    if (!changeType || !severity || !impactDescription || !detectedAt) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const change = await prisma.landChange.create({
      data: {
        zoneId,
        changeType,
        severity,
        beforeImageUrl,
        afterImageUrl,
        affectedArea,
        impactDescription,
        causesIdentified,
        recommendedAction,
        detectedAt: new Date(detectedAt)
      }
    });

    res.status(201).json({
      success: true,
      message: 'Land change reported successfully',
      data: { change }
    });
  } catch (error) {
    console.error('Create change error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report change'
    });
  }
};

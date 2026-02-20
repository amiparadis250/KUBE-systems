/**
 * Report Controller
 * Generate and manage reports
 */

import { Request, Response } from 'express';
import prisma from '../utils/db';

/**
 * Get all reports
 */
export const getReports = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    const reports = await prisma.report.findMany({
      where: !isAdmin ? { generatedById: userId } : undefined,
      include: {
        generatedBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { generatedAt: 'desc' }
    });

    res.json({
      success: true,
      data: { reports }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reports'
    });
  }
};

/**
 * Get single report by ID
 */
export const getReportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        generatedBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get report'
    });
  }
};

/**
 * Generate a new report
 */
export const generateReport = async (req: Request, res: Response) => {
  try {
    const { title, type, module, description, periodStart, periodEnd, dataSnapshot, charts } = req.body;
    const userId = req.user?.id;

    if (!title || !type || !module || !dataSnapshot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const report = await prisma.report.create({
      data: {
        title,
        type,
        module,
        description,
        periodStart: periodStart ? new Date(periodStart) : undefined,
        periodEnd: periodEnd ? new Date(periodEnd) : undefined,
        dataSnapshot: typeof dataSnapshot === 'string' ? dataSnapshot : JSON.stringify(dataSnapshot),
        charts: charts ? (typeof charts === 'string' ? charts : JSON.stringify(charts)) : undefined,
        generatedById: userId!
      },
      include: {
        generatedBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      data: { report }
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report'
    });
  }
};

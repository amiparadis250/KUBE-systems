/**
 * User Controller
 * User management operations
 */

import { Request, Response } from 'express';
import prisma from '../utils/db';

/**
 * Get all users (Admin only)
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        businessType: true,
        services: true,
        companyName: true,
        organization: true,
        createdAt: true,
        lastLoginAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Parse services JSON string to array for frontend
    const parsedUsers = users.map(user => ({
      ...user,
      services: user.services ? JSON.parse(user.services) : []
    }));

    res.json({
      success: true,
      data: { users: parsedUsers }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        organization: true,
        location: true,
        language: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
};

/**
 * Create user (Admin only)
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      email, password, firstName, lastName, phone, role,
      businessType, services, companyName, organization
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, last name, and role are required'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        role,
        status: 'ACTIVE',
        businessType: businessType || null,
        services: services ? JSON.stringify(services) : null,
        companyName: companyName || null,
        organization: organization || null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        businessType: true,
        services: true,
        companyName: true,
        organization: true,
        createdAt: true
      }
    });

    // Parse services for response
    const parsedUser = {
      ...user,
      services: user.services ? JSON.parse(user.services) : []
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: parsedUser }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
};

/**
 * Update user
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, avatar, organization, location, language } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phone,
        avatar,
        organization,
        location,
        language
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatar: true,
        organization: true,
        location: true,
        language: true
      }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const usersRouter = Router();

// Get all users
usersRouter.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(users);
  } catch (error: any) {
    console.error('Users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message || 'Unknown error occurred',
    });
  }
});

// Get user by ID
usersRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('User error:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      message: error.message || 'Unknown error occurred',
    });
  }
});

// Create user
usersRouter.post('/', async (req, res) => {
  try {
    const { name, email, role, department, phone, status } = req.body;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role || 'USER',
        department,
        phone,
        status: status || 'ACTIVE',
      },
    });

    res.status(201).json(user);
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'Failed to create user',
      message: error.message || 'Unknown error occurred',
    });
  }
});

// Update user
usersRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, department, phone, status } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
        department,
        phone,
        status,
      },
    });

    res.json(user);
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: error.message || 'Unknown error occurred',
    });
  }
});

// Delete user
usersRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: error.message || 'Unknown error occurred',
    });
  }
});


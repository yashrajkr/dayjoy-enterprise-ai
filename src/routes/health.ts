import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { config } from '../config';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), version: config.version });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', timestamp: new Date().toISOString() });
  }
});

healthRouter.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'not ready' });
  }
});

healthRouter.get('/live', (req, res) => {
  res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

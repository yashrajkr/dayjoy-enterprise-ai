import express from 'express';
import cors from 'cors';
import { config } from './config';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { healthRouter } from './routes/health';
import { prisma } from './lib/prisma';

const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: config.uploadMaxSize }));
app.use(express.urlencoded({ extended: true, limit: config.uploadMaxSize }));
app.use(requestLogger);
app.use('/health', healthRouter);
app.get('/', (req, res) => {
  res.json({ name: 'Dayjoy Enterprise AI Platform', version: config.version, status: 'running' });
});
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Route ${req.method} ${req.path} not found` });
});
app.use(errorHandler);

async function startServer() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected');
    app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📍 URL: http://localhost:${config.port}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string) {
  logger.info(`\n🛑 ${signal}. Shutting down...`);
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
export { app, prisma };

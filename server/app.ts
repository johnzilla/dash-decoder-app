import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { healthRouter } from './routes/health.js';
import { sessionsRouter } from './routes/sessions.js';
import { analyzeRouter } from './routes/analyze.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use('/health', healthRouter);
  app.use('/api/sessions', sessionsRouter);
  app.use('/api/analyze', analyzeRouter);
  app.use(errorHandler);
  return app;
}

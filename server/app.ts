import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { healthRouter } from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use('/health', healthRouter);
  // Routes for /api/sessions and /api/analyze added in Plan 02
  app.use(errorHandler);
  return app;
}

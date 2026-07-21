import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { DataDragonClient } from './clients/data-dragon.client.js';
import { RiotClient } from './clients/riot.client.js';
import type { AppConfig } from './config/env.js';
import { PlayerController } from './controllers/player.controller.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { createPlayerRouter } from './routes/player.routes.js';
import { PlayerService } from './services/player.service.js';

export const createApp = (config: AppConfig): Express => {
  const app = express();
  const riotClient = new RiotClient(config.riot);
  const dataDragonClient = new DataDragonClient();
  const playerService = new PlayerService(riotClient, dataDragonClient);
  const playerController = new PlayerController(playerService);

  app.disable('x-powered-by');
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: config.painelUrl }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/health', (_request, response) => response.json({ status: 'ok' }));
  app.use('/player', createPlayerRouter(playerController));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

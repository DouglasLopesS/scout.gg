import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { DataDragonClient } from './clients/data-dragon.client.js';
import { RiotClientRegistry } from './clients/riot-client-registry.js';
import type { AppConfig } from './config/env.js';
import { PlayerController } from './controllers/player.controller.js';
import { MatchDetailsController } from './controllers/match-details.controller.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { createPlayerRouter } from './routes/player.routes.js';
import { createMatchDetailsRouter } from './routes/match-details.routes.js';
import { MatchDetailsService } from './services/match-details.service.js';
import { PlayerService } from './services/player.service.js';

export const createApp = (config: AppConfig): Express => {
  const app = express();
  const riotClients = new RiotClientRegistry(config.riot.apiKey);
  const dataDragonClient = new DataDragonClient();
  const playerService = new PlayerService(riotClients, dataDragonClient);
  const matchDetailsService = new MatchDetailsService(riotClients, dataDragonClient);
  const playerController = new PlayerController(playerService, config.riot.platform);
  const matchDetailsController = new MatchDetailsController(matchDetailsService, config.riot.platform);

  app.disable('x-powered-by');
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: config.painelUrl }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/health', (_request, response) => response.json({ status: 'ok' }));
  app.use('/player', createPlayerRouter(playerController));
  app.use('/matches', createMatchDetailsRouter(matchDetailsController));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

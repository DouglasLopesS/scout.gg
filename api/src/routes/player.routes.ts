import { Router } from 'express';
import { PlayerController } from '../controllers/player.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

export const createPlayerRouter = (controller: PlayerController): Router => {
  const router = Router();
  router.get('/:gameName/:tagLine', asyncHandler(controller.getPlayer));
  return router;
};

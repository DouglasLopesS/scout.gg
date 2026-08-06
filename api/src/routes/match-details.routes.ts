import { Router } from 'express';
import { MatchDetailsController } from '../controllers/match-details.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

export const createMatchDetailsRouter = (controller: MatchDetailsController): Router => {
  const router = Router();
  router.get('/:matchId', asyncHandler(controller.getMatch));
  return router;
};

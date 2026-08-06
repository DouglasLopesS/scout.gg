import type { Request, Response } from 'express';
import { MatchDetailsService } from '../services/match-details.service.js';
import { AppError } from '../utils/app-error.js';

export class MatchDetailsController {
  constructor(private readonly matchDetailsService: MatchDetailsService) {}

  getMatch = async (request: Request, response: Response): Promise<void> => {
    const matchId = this.validateMatchId(request.params['matchId']);
    const match = await this.matchDetailsService.findById(matchId);
    response.status(200).json(match);
  };

  private validateMatchId(value: string | string[] | undefined): string {
    const matchId = typeof value === 'string' ? value.trim().toUpperCase() : '';
    if (!/^[A-Z0-9_]{5,64}$/.test(matchId)) {
      throw new AppError(400, 'O identificador da partida é inválido.', 'INVALID_MATCH_ID');
    }
    return matchId;
  }
}

import type { Request, Response } from 'express';
import { PlayerService } from '../services/player.service.js';
import { AppError } from '../utils/app-error.js';

export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  getPlayer = async (request: Request, response: Response): Promise<void> => {
    const gameName = this.validatePart(request.params['gameName'], 'nome', 3, 16);
    const tagLine = this.validatePart(request.params['tagLine'], 'tag', 3, 5);
    const player = await this.playerService.findByRiotId(gameName, tagLine);
    response.status(200).json(player);
  };

  private validatePart(value: string | string[] | undefined, label: string, min: number, max: number): string {
    const normalized = typeof value === 'string' ? value.trim() : undefined;
    if (!normalized || normalized.length < min || normalized.length > max) {
      throw new AppError(400, `O ${label} do Riot ID deve ter entre ${min} e ${max} caracteres.`, 'INVALID_RIOT_ID');
    }
    return normalized;
  }
}

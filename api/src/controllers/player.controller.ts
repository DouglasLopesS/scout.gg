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

  getMatches = async (request: Request, response: Response): Promise<void> => {
    const puuid = this.validatePuuid(request.params['puuid']);
    const start = this.validateInteger(request.query['start'], 'start', 0, 990, 0);
    const count = this.validateInteger(request.query['count'], 'count', 1, 20, 10);
    const page = await this.playerService.findMatches(puuid, start, count);
    response.status(200).json(page);
  };

  private validatePart(value: string | string[] | undefined, label: string, min: number, max: number): string {
    const normalized = typeof value === 'string' ? value.trim() : undefined;
    if (!normalized || normalized.length < min || normalized.length > max) {
      throw new AppError(400, `O ${label} do Riot ID deve ter entre ${min} e ${max} caracteres.`, 'INVALID_RIOT_ID');
    }
    return normalized;
  }

  private validatePuuid(value: string | string[] | undefined): string {
    const puuid = typeof value === 'string' ? value.trim() : '';
    if (!/^[A-Za-z0-9_-]{20,128}$/.test(puuid)) {
      throw new AppError(400, 'O PUUID informado é inválido.', 'INVALID_PUUID');
    }
    return puuid;
  }

  private validateInteger(
    value: unknown,
    label: string,
    min: number,
    max: number,
    fallback: number
  ): number {
    if (value === undefined) return fallback;
    const parsed = typeof value === 'string' ? Number(value) : Number.NaN;
    if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
      throw new AppError(400, `O parâmetro ${label} é inválido.`, 'INVALID_PAGINATION');
    }
    return parsed;
  }
}

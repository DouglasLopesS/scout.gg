import { isRiotPlatform, type RiotPlatform } from '../config/riot-routing.js';
import { AppError } from './app-error.js';

export function validatePlatform(value: unknown, fallback: RiotPlatform): RiotPlatform {
  if (value === undefined) return fallback;
  if (typeof value !== 'string') {
    throw new AppError(400, 'A plataforma informada é inválida.', 'INVALID_PLATFORM');
  }
  const platform = value.trim().toLowerCase();
  if (!isRiotPlatform(platform)) {
    throw new AppError(400, 'A plataforma informada é inválida.', 'INVALID_PLATFORM');
  }
  return platform;
}

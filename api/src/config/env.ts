import 'dotenv/config';
import { isRiotPlatform, type RiotPlatform } from './riot-routing.js';

const required = (name: 'RIOT_API_KEY'): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} não configurada. Copie .env.example para .env.`);
  }
  return value;
};

export interface AppConfig {
  port: number;
  painelUrl: string;
  riot: {
    apiKey: string;
    platform: RiotPlatform;
  };
}

const defaultPlatform = (): RiotPlatform => {
  const platform = process.env.RIOT_PLATFORM?.trim().toLowerCase() || 'br1';
  if (!isRiotPlatform(platform)) {
    throw new Error(`RIOT_PLATFORM inválida: ${platform}.`);
  }
  return platform;
};

export const loadConfig = (): AppConfig => ({
  port: Number(process.env.PORT) || 3000,
  painelUrl: process.env.PAINEL_URL?.trim() || 'http://localhost:4200',
  riot: {
    apiKey: required('RIOT_API_KEY'),
    platform: defaultPlatform()
  }
});

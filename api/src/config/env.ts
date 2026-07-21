import 'dotenv/config';

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
    platform: string;
    region: string;
  };
}

export const loadConfig = (): AppConfig => ({
  port: Number(process.env.PORT) || 3000,
  painelUrl: process.env.PAINEL_URL?.trim() || 'http://localhost:4200',
  riot: {
    apiKey: required('RIOT_API_KEY'),
    platform: process.env.RIOT_PLATFORM?.trim().toLowerCase() || 'br1',
    region: process.env.RIOT_REGION?.trim().toLowerCase() || 'americas'
  }
});

export const RIOT_SERVERS = [
  { platform: 'br1', region: 'americas', label: 'Brasil (BR1)' },
  { platform: 'na1', region: 'americas', label: 'América do Norte (NA1)' },
  { platform: 'la1', region: 'americas', label: 'América Latina Norte (LA1)' },
  { platform: 'la2', region: 'americas', label: 'América Latina Sul (LA2)' },
  { platform: 'euw1', region: 'europe', label: 'Europa Oeste (EUW1)' },
  { platform: 'eun1', region: 'europe', label: 'Europa Nórdica/Leste (EUN1)' },
  { platform: 'tr1', region: 'europe', label: 'Turquia (TR1)' },
  { platform: 'ru', region: 'europe', label: 'Rússia (RU)' },
  { platform: 'kr', region: 'asia', label: 'Coreia (KR)' },
  { platform: 'jp1', region: 'asia', label: 'Japão (JP1)' },
  { platform: 'oc1', region: 'sea', label: 'Oceania (OC1)' },
  { platform: 'ph2', region: 'sea', label: 'Filipinas (PH2)' },
  { platform: 'sg2', region: 'sea', label: 'Singapura (SG2)' },
  { platform: 'th2', region: 'sea', label: 'Tailândia (TH2)' },
  { platform: 'tw2', region: 'sea', label: 'Taiwan (TW2)' },
  { platform: 'vn2', region: 'sea', label: 'Vietnã (VN2)' }
] as const;

export type RiotPlatform = typeof RIOT_SERVERS[number]['platform'];
export type RiotRegion = typeof RIOT_SERVERS[number]['region'];
export interface RiotServer { platform: RiotPlatform; region: RiotRegion }
export interface PlayerSearchRequest { gameName: string; tagLine: string; platform: RiotPlatform }

export function isRiotPlatform(value: string): value is RiotPlatform {
  return RIOT_SERVERS.some((server) => server.platform === value);
}

export function regionForPlatform(platform: RiotPlatform): RiotRegion {
  const server = RIOT_SERVERS.find((entry) => entry.platform === platform);
  if (!server) throw new Error(`Plataforma inválida: ${platform}`);
  return server.region;
}

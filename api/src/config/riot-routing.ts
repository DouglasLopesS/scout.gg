export const PLATFORM_REGIONS = {
  br1: 'americas',
  na1: 'americas',
  la1: 'americas',
  la2: 'americas',
  euw1: 'europe',
  eun1: 'europe',
  tr1: 'europe',
  ru: 'europe',
  kr: 'asia',
  jp1: 'asia',
  oc1: 'sea',
  ph2: 'sea',
  sg2: 'sea',
  th2: 'sea',
  tw2: 'sea',
  vn2: 'sea'
} as const;

export type RiotPlatform = keyof typeof PLATFORM_REGIONS;
export type RiotRegion = typeof PLATFORM_REGIONS[RiotPlatform];

export interface RiotRouting {
  platform: RiotPlatform;
  region: RiotRegion;
}

export function isRiotPlatform(value: string): value is RiotPlatform {
  return Object.hasOwn(PLATFORM_REGIONS, value);
}

export function routingForPlatform(platform: RiotPlatform): RiotRouting {
  return { platform, region: PLATFORM_REGIONS[platform] };
}

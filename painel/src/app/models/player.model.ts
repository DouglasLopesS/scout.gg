export interface PlayerRank {
  queueType: string;
  tier: string;
  division: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface MatchAssets {
  championIcon: string;
  championSplash: string;
  items: string[];
  spells: string[];
  runes: string[];
}

export interface PlayerMatch {
  id: string;
  playedAt: string;
  durationSeconds: number;
  queueId: number;
  queueName: string;
  gameMode: string;
  win: boolean;
  champion: { id: number; name: string; level: number };
  kda: { kills: number; deaths: number; assists: number; ratio: number };
  cs: number;
  gold: number;
  damageToChampions: number;
  itemIds: number[];
  spellIds: number[];
  runeIds: number[];
  assets: MatchAssets;
}

export interface Player {
  account: { puuid: string; gameName: string; tagLine: string };
  profile: { summonerId: string; level: number; profileIconId: number; profileIconUrl: string };
  rank: PlayerRank | null;
  matches: PlayerMatch[];
  dataDragonVersion: string;
}

export interface ApiErrorResponse {
  error?: { code?: string; message?: string };
}

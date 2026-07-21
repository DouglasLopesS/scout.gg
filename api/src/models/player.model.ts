export interface AssetUrls {
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
  assets: AssetUrls;
}

export interface PlayerResponse {
  account: { puuid: string; gameName: string; tagLine: string };
  profile: { summonerId: string; level: number; profileIconId: number; profileIconUrl: string };
  rank: {
    queueType: string;
    tier: string;
    division: string;
    leaguePoints: number;
    wins: number;
    losses: number;
    winRate: number;
  } | null;
  matches: PlayerMatch[];
  dataDragonVersion: string;
}

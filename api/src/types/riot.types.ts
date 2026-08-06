export interface RiotAccountDto {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface RiotSummonerDto {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface RiotLeagueEntryDto {
  leagueId: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

export interface RiotPerkStyleDto {
  description: string;
  style: number;
  selections: Array<{ perk: number; var1: number; var2: number; var3: number }>;
}

export interface RiotParticipantDto {
  puuid: string;
  riotIdGameName?: string;
  riotIdTagline?: string;
  teamId: number;
  championId: number;
  championName: string;
  champLevel: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  goldEarned: number;
  totalDamageDealtToChampions: number;
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;
  summoner1Id: number;
  summoner2Id: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  perks: {
    styles: RiotPerkStyleDto[];
    statPerks: { defense: number; flex: number; offense: number };
  };
}

export interface RiotObjectiveDto {
  first: boolean;
  kills: number;
}

export interface RiotTeamDto {
  teamId: number;
  win: boolean;
  objectives: {
    baron?: RiotObjectiveDto;
    champion?: RiotObjectiveDto;
    dragon?: RiotObjectiveDto;
    horde?: RiotObjectiveDto;
    inhibitor?: RiotObjectiveDto;
    riftHerald?: RiotObjectiveDto;
    tower?: RiotObjectiveDto;
  };
}

export interface RiotMatchDto {
  metadata: { matchId: string; participants: string[] };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameEndTimestamp?: number;
    gameMode: string;
    gameType: string;
    gameVersion: string;
    queueId: number;
    participants: RiotParticipantDto[];
    teams: RiotTeamDto[];
  };
}

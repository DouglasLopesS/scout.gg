export interface MatchObjectives {
  towers: number;
  dragons: number;
  barons: number;
  riftHeralds: number;
  inhibitors: number;
}

export interface MatchTeamDetails {
  teamId: number;
  side: 'blue' | 'red';
  win: boolean;
  kills: number;
  gold: number;
  objectives: MatchObjectives;
}

export interface MatchParticipantDetails {
  puuid: string;
  riotIdGameName: string;
  riotIdTagline: string;
  teamId: number;
  championId: number;
  championName: string;
  championLevel: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  totalCs: number;
  goldEarned: number;
  totalDamageDealtToChampions: number;
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;
  summonerSpell1Id: number;
  summonerSpell2Id: number;
  primaryRuneId: number | null;
  secondaryRuneStyleId: number | null;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  win: boolean;
}

export interface MatchDetails {
  matchId: string;
  playedAt: string;
  durationSeconds: number;
  gameMode: string;
  queueId: number;
  queueName: string;
  gameVersion: string;
  dataDragonVersion: string;
  teams: MatchTeamDetails[];
  participants: MatchParticipantDetails[];
}

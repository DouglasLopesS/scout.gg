import { DataDragonClient } from '../clients/data-dragon.client.js';
import { RiotClientRegistry } from '../clients/riot-client-registry.js';
import type { RiotPlatform } from '../config/riot-routing.js';
import type {
  MatchDetailsResponse,
  MatchParticipantDetails,
  MatchTeamDetails
} from '../models/match-details.model.js';
import type { RiotMatchDto, RiotParticipantDto, RiotTeamDto } from '../types/riot.types.js';
import { AppError } from '../utils/app-error.js';
import { getQueueName } from '../utils/queue-names.js';

export class MatchDetailsService {
  constructor(
    private readonly riotClients: RiotClientRegistry,
    private readonly dataDragonClient: DataDragonClient
  ) {}

  async findById(matchId: string, platform: RiotPlatform): Promise<MatchDetailsResponse> {
    const [match, dataDragonVersion] = await Promise.all([
      this.riotClients.getMatch(platform, matchId),
      this.dataDragonClient.getLatestVersion()
    ]);

    return this.mapMatch(match, dataDragonVersion);
  }

  private mapMatch(match: RiotMatchDto, dataDragonVersion: string): MatchDetailsResponse {
    if (
      !match.metadata?.matchId
      || !Number.isFinite(match.info?.gameCreation)
      || !Array.isArray(match.info?.teams)
      || !Array.isArray(match.info?.participants)
    ) {
      throw new AppError(502, 'A Riot retornou dados incompletos para esta partida.', 'INVALID_MATCH_DATA');
    }

    return {
      matchId: match.metadata.matchId,
      playedAt: new Date(match.info.gameCreation).toISOString(),
      durationSeconds: this.number(match.info.gameDuration),
      gameMode: match.info.gameMode || 'Modo desconhecido',
      queueId: this.number(match.info.queueId),
      queueName: getQueueName(this.number(match.info.queueId)),
      gameVersion: match.info.gameVersion || dataDragonVersion,
      dataDragonVersion,
      teams: match.info.teams.map((team) => this.mapTeam(team, match.info.participants)),
      participants: match.info.participants.map((participant) => this.mapParticipant(participant))
    };
  }

  private mapTeam(team: RiotTeamDto, participants: RiotParticipantDto[]): MatchTeamDetails {
    const teamParticipants = participants.filter(({ teamId }) => teamId === team.teamId);
    const objectiveKills = (objective: { kills: number } | undefined): number => this.number(objective?.kills);

    return {
      teamId: this.number(team.teamId),
      side: team.teamId === 100 ? 'blue' : 'red',
      win: Boolean(team.win),
      kills: teamParticipants.reduce((total, participant) => total + this.number(participant.kills), 0),
      gold: teamParticipants.reduce((total, participant) => total + this.number(participant.goldEarned), 0),
      objectives: {
        towers: objectiveKills(team.objectives?.tower),
        dragons: objectiveKills(team.objectives?.dragon),
        barons: objectiveKills(team.objectives?.baron),
        riftHeralds: objectiveKills(team.objectives?.riftHerald),
        inhibitors: objectiveKills(team.objectives?.inhibitor)
      }
    };
  }

  private mapParticipant(participant: RiotParticipantDto): MatchParticipantDetails {
    const styles = participant.perks?.styles ?? [];
    const primaryStyle = styles[0];
    const secondaryStyle = styles[1];

    return {
      puuid: participant.puuid || '',
      riotIdGameName: participant.riotIdGameName?.trim() || 'Jogador desconhecido',
      riotIdTagline: participant.riotIdTagline?.trim() || '',
      teamId: this.number(participant.teamId),
      championId: this.number(participant.championId),
      championName: participant.championName || 'Campeão desconhecido',
      championLevel: this.number(participant.champLevel),
      kills: this.number(participant.kills),
      deaths: this.number(participant.deaths),
      assists: this.number(participant.assists),
      kda: Number(((this.number(participant.kills) + this.number(participant.assists)) / Math.max(1, this.number(participant.deaths))).toFixed(2)),
      totalMinionsKilled: this.number(participant.totalMinionsKilled),
      neutralMinionsKilled: this.number(participant.neutralMinionsKilled),
      totalCs: this.number(participant.totalMinionsKilled) + this.number(participant.neutralMinionsKilled),
      goldEarned: this.number(participant.goldEarned),
      totalDamageDealtToChampions: this.number(participant.totalDamageDealtToChampions),
      visionScore: this.number(participant.visionScore),
      wardsPlaced: this.number(participant.wardsPlaced),
      wardsKilled: this.number(participant.wardsKilled),
      summonerSpell1Id: this.number(participant.summoner1Id),
      summonerSpell2Id: this.number(participant.summoner2Id),
      primaryRuneId: primaryStyle?.selections[0]?.perk ?? null,
      secondaryRuneStyleId: secondaryStyle?.style ?? null,
      item0: this.number(participant.item0),
      item1: this.number(participant.item1),
      item2: this.number(participant.item2),
      item3: this.number(participant.item3),
      item4: this.number(participant.item4),
      item5: this.number(participant.item5),
      item6: this.number(participant.item6),
      win: Boolean(participant.win)
    };
  }

  private number(value: number | undefined): number {
    return Number.isFinite(value) ? value as number : 0;
  }
}

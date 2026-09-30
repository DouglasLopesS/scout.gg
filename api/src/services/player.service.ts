import { DataDragonClient, type DataDragonCatalog } from '../clients/data-dragon.client.js';
import { RiotClientRegistry } from '../clients/riot-client-registry.js';
import { routingForPlatform, type RiotPlatform } from '../config/riot-routing.js';
import type { PlayerMatch, PlayerMatchesPage, PlayerResponse } from '../models/player.model.js';
import type { RiotLeagueEntryDto, RiotMatchDto, RiotParticipantDto } from '../types/riot.types.js';
import { AppError } from '../utils/app-error.js';
import { getQueueName } from '../utils/queue-names.js';

export class PlayerService {
  constructor(
    private readonly riotClients: RiotClientRegistry,
    private readonly dataDragonClient: DataDragonClient
  ) {}

  async findByRiotId(gameName: string, tagLine: string, platform: RiotPlatform): Promise<PlayerResponse> {
    const riotClient = this.riotClients.get(platform);
    const account = await riotClient.getAccountByRiotId(gameName, tagLine);
    const [summoner, matchIds, dataDragonVersion] = await Promise.all([
      riotClient.getSummonerByPuuid(account.puuid),
      riotClient.getMatchIds(account.puuid, 0, 11),
      this.dataDragonClient.getLatestVersion()
    ]);
    const visibleMatchIds = matchIds.slice(0, 10);
    const [entries, matchDtos, catalog] = await Promise.all([
      riotClient.getLeagueEntries(account.puuid),
      Promise.all(visibleMatchIds.map((id) => this.riotClients.getMatch(platform, id))),
      this.dataDragonClient.getCatalog(dataDragonVersion)
    ]);

    return {
      server: routingForPlatform(platform),
      account,
      profile: {
        summonerId: summoner.id,
        level: summoner.summonerLevel,
        profileIconId: summoner.profileIconId,
        profileIconUrl: this.dataDragonClient.profileIcon(dataDragonVersion, summoner.profileIconId)
      },
      rank: this.mapRank(entries),
      matches: matchDtos.map((match) => this.mapMatch(match, account.puuid, dataDragonVersion, catalog)),
      hasMoreMatches: matchIds.length > visibleMatchIds.length,
      dataDragonVersion
    };
  }

  async findMatches(puuid: string, start: number, count: number, platform: RiotPlatform): Promise<PlayerMatchesPage> {
    const riotClient = this.riotClients.get(platform);
    const [matchIds, dataDragonVersion] = await Promise.all([
      riotClient.getMatchIds(puuid, start, count + 1),
      this.dataDragonClient.getLatestVersion()
    ]);
    const visibleMatchIds = matchIds.slice(0, count);
    const [matchDtos, catalog] = await Promise.all([
      Promise.all(visibleMatchIds.map((id) => this.riotClients.getMatch(platform, id))),
      this.dataDragonClient.getCatalog(dataDragonVersion)
    ]);

    return {
      matches: matchDtos.map((match) => this.mapMatch(match, puuid, dataDragonVersion, catalog)),
      hasMore: matchIds.length > visibleMatchIds.length
    };
  }

  private mapRank(entries: RiotLeagueEntryDto[]): PlayerResponse['rank'] {
    const entry = entries.find(({ queueType }) => queueType === 'RANKED_SOLO_5x5')
      ?? entries.find(({ queueType }) => queueType === 'RANKED_FLEX_SR');
    if (!entry) {
      return null;
    }
    const games = entry.wins + entry.losses;
    return {
      queueType: entry.queueType,
      tier: entry.tier,
      division: entry.rank,
      leaguePoints: entry.leaguePoints,
      wins: entry.wins,
      losses: entry.losses,
      winRate: games === 0 ? 0 : Math.round((entry.wins / games) * 100)
    };
  }

  private mapMatch(
    match: RiotMatchDto,
    puuid: string,
    version: string,
    catalog: DataDragonCatalog
  ): PlayerMatch {
    const participant = match.info.participants.find((item) => item.puuid === puuid);
    if (!participant) {
      throw new AppError(502, 'Uma partida retornou dados incompletos.', 'INVALID_MATCH_DATA');
    }
    const itemIds = this.getItemIds(participant);
    const spellIds = [participant.summoner1Id, participant.summoner2Id];
    const runeIds = this.getRuneIds(participant);
    return {
      id: match.metadata.matchId,
      playedAt: new Date(match.info.gameCreation).toISOString(),
      durationSeconds: match.info.gameDuration,
      queueId: match.info.queueId,
      queueName: getQueueName(match.info.queueId),
      gameMode: match.info.gameMode,
      win: participant.win,
      champion: {
        id: participant.championId,
        name: participant.championName,
        level: participant.champLevel
      },
      kda: {
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        ratio: Number(((participant.kills + participant.assists) / Math.max(1, participant.deaths)).toFixed(2))
      },
      cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
      gold: participant.goldEarned,
      damageToChampions: participant.totalDamageDealtToChampions,
      itemIds,
      spellIds,
      runeIds,
      assets: {
        championIcon: this.dataDragonClient.championIcon(version, participant.championName),
        championSplash: this.dataDragonClient.championSplash(participant.championName),
        items: itemIds.map((id) => this.dataDragonClient.item(version, id)),
        spells: spellIds.flatMap((id) => catalog.spellIcons.get(id) ?? []),
        runes: runeIds.flatMap((id) => catalog.runeIcons.get(id) ?? [])
      }
    };
  }

  private getItemIds(participant: RiotParticipantDto): number[] {
    return [
      participant.item0,
      participant.item1,
      participant.item2,
      participant.item3,
      participant.item4,
      participant.item5,
      participant.item6
    ].filter((id) => id > 0);
  }

  private getRuneIds(participant: RiotParticipantDto): number[] {
    const primary = participant.perks.styles[0];
    const ids = [primary?.selections[0]?.perk, primary?.style, participant.perks.styles[1]?.style];
    return ids.filter((id): id is number => typeof id === 'number' && id > 0);
  }
}

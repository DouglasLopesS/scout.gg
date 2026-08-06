import axios, { AxiosError, type AxiosInstance } from 'axios';
import type { AppConfig } from '../config/env.js';
import type {
  RiotAccountDto,
  RiotLeagueEntryDto,
  RiotMatchDto,
  RiotSummonerDto
} from '../types/riot.types.js';
import { AppError } from '../utils/app-error.js';

const FRIENDLY_ERRORS: Readonly<Record<number, { message: string; code: string }>> = {
  401: { message: 'A chave da Riot é inválida ou expirou.', code: 'RIOT_UNAUTHORIZED' },
  403: { message: 'A Riot recusou o acesso. Verifique a chave da API.', code: 'RIOT_FORBIDDEN' },
  404: { message: 'Jogador não encontrado para este Riot ID.', code: 'PLAYER_NOT_FOUND' },
  429: { message: 'Muitas consultas no momento. Aguarde alguns segundos e tente novamente.', code: 'RATE_LIMITED' }
};

export class RiotClient {
  private readonly platformClient: AxiosInstance;
  private readonly regionalClient: AxiosInstance;

  constructor(config: AppConfig['riot']) {
    const commonConfig = {
      timeout: 10_000,
      headers: { 'X-Riot-Token': config.apiKey }
    };
    this.platformClient = axios.create({
      ...commonConfig,
      baseURL: `https://${config.platform}.api.riotgames.com`
    });
    this.regionalClient = axios.create({
      ...commonConfig,
      baseURL: `https://${config.region}.api.riotgames.com`
    });
  }

  async getAccountByRiotId(gameName: string, tagLine: string): Promise<RiotAccountDto> {
    return this.request(() => this.regionalClient.get<RiotAccountDto>(
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
    ));
  }

  async getSummonerByPuuid(puuid: string): Promise<RiotSummonerDto> {
    return this.request(() => this.platformClient.get<RiotSummonerDto>(
      `/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`
    ));
  }

  async getLeagueEntries(puuid: string): Promise<RiotLeagueEntryDto[]> {
    return this.request(() => this.platformClient.get<RiotLeagueEntryDto[]>(
      `/lol/league/v4/entries/by-puuid/${encodeURIComponent(puuid)}`
    ));
  }

  async getMatchIds(puuid: string, start = 0, count = 10): Promise<string[]> {
    return this.request(() => this.regionalClient.get<string[]>(
      `/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids`,
      { params: { start, count } }
    ));
  }

  async getMatch(matchId: string): Promise<RiotMatchDto> {
    return this.request(() => this.regionalClient.get<RiotMatchDto>(
      `/lol/match/v5/matches/${encodeURIComponent(matchId)}`
    ), { message: 'Partida não encontrada.', code: 'MATCH_NOT_FOUND' });
  }

  private async request<T>(
    call: () => Promise<{ data: T }>,
    notFound = FRIENDLY_ERRORS[404]
  ): Promise<T> {
    try {
      return (await call()).data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const status = error.response?.status ?? 503;
        const friendly = status === 404 ? notFound : FRIENDLY_ERRORS[status];
        if (friendly) {
          throw new AppError(status, friendly.message, friendly.code);
        }
        throw new AppError(
          status >= 500 ? 502 : status,
          'Não foi possível consultar a Riot agora. Tente novamente mais tarde.',
          'RIOT_API_ERROR'
        );
      }
      throw error;
    }
  }
}

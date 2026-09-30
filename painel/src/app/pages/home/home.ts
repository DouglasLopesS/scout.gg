import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { LucideActivity, LucideChartNoAxesColumnIncreasing, LucideRadar, LucideSearch, LucideUserRoundSearch } from '@lucide/angular';
import { MatchCard } from '../../components/match-card/match-card';
import { MatchPerformance } from '../../components/match-performance/match-performance';
import { MatchTrends } from '../../components/match-trends/match-trends';
import { MatchDetailsPanel } from '../../components/match-details-panel/match-details-panel';
import { LoadMoreButton } from '../../components/load-more-button/load-more-button';
import { PlayerSearch } from '../../components/player-search/player-search';
import { PlayerSummary } from '../../components/player-summary/player-summary';
import { UiState } from '../../components/ui-state/ui-state';
import type { ApiErrorResponse } from '../../models/player.model';
import type { SearchState } from '../../models/search-state.model';
import { PlayerService } from '../../services/player.service';
import { summarizeMatches } from '../../shared/match-summary';
import { regionForPlatform, type PlayerSearchRequest, type RiotPlatform } from '../../shared/riot-routing';

@Component({
  selector: 'app-home',
  imports: [
    LucideActivity,
    LucideChartNoAxesColumnIncreasing,
    LucideRadar,
    LucideSearch,
    LucideUserRoundSearch,
    MatchCard,
    MatchPerformance,
    MatchTrends,
    MatchDetailsPanel,
    LoadMoreButton,
    PlayerSearch,
    PlayerSummary,
    UiState
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private readonly playerService = inject(PlayerService);
  private lastSearch: PlayerSearchRequest | null = null;
  private searchVersion = 0;
  private nextMatchStart = 0;

  readonly state = signal<SearchState>({ status: 'idle', player: null, errorMessage: '' });
  readonly selectedMatchId = signal<string | null>(null);
  readonly loadingMore = signal(false);
  readonly loadMoreError = signal('');
  readonly activeRiotId = signal('');
  readonly selectedPlatform = signal<RiotPlatform>('br1');
  readonly selectedRegion = computed(() => regionForPlatform(this.selectedPlatform()));
  readonly displayedServer = computed(() => this.state().player?.server ?? {
    platform: this.selectedPlatform(),
    region: this.selectedRegion()
  });
  readonly selectedQueueId = signal<number | null>(null);
  readonly selectedChampionId = signal<number | null>(null);
  readonly selectedResult = signal<'all' | 'win' | 'loss'>('all');
  readonly queueOptions = computed(() => {
    const matches = this.state().player?.matches ?? [];
    const queues = new Map<number, string>();
    for (const match of matches) queues.set(match.queueId, match.queueName);
    return [...queues].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  });
  readonly championOptions = computed(() => {
    const matches = this.state().player?.matches ?? [];
    const champions = new Map<number, string>();
    for (const match of matches) champions.set(match.champion.id, match.champion.name);
    return [...champions].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  });
  readonly visibleMatches = computed(() => {
    const matches = this.state().player?.matches ?? [];
    const queueId = this.selectedQueueId();
    const championId = this.selectedChampionId();
    const result = this.selectedResult();
    return matches.filter((match) =>
      (queueId === null || match.queueId === queueId)
      && (championId === null || match.champion.id === championId)
      && (result === 'all' || match.win === (result === 'win'))
    );
  });
  readonly matchSummary = computed(() => summarizeMatches(this.visibleMatches()));

  search(riotId: PlayerSearchRequest): void {
    const searchVersion = ++this.searchVersion;
    this.selectedPlatform.set(riotId.platform);
    this.activeRiotId.set(`${riotId.gameName}#${riotId.tagLine}`);
    this.selectedMatchId.set(null);
    this.loadingMore.set(false);
    this.loadMoreError.set('');
    this.selectedQueueId.set(null);
    this.selectedChampionId.set(null);
    this.selectedResult.set('all');
    this.nextMatchStart = 0;
    this.lastSearch = riotId;
    this.state.set({ status: 'loading', player: null, errorMessage: '' });
    this.playerService.findByRiotId(riotId.gameName, riotId.tagLine, riotId.platform)
      .subscribe({
        next: (player) => {
          if (searchVersion !== this.searchVersion) return;
          this.nextMatchStart = player.matches.length;
          const status = player.matches.length ? 'success' : 'empty';
          this.state.set({ status, player, errorMessage: '' });
        },
        error: (error: unknown) => {
          if (searchVersion !== this.searchVersion) return;
          const errorMessage = this.getErrorMessage(error);
          this.state.set({ status: 'error', player: null, errorMessage });
        }
      });
  }

  retry(): void {
    if (this.lastSearch) this.search(this.lastSearch);
  }

  openMatch(matchId: string): void {
    this.selectedMatchId.update((selected) => selected === matchId ? null : matchId);
  }

  closeMatch(): void {
    this.selectedMatchId.set(null);
  }

  selectQueue(queueId: number | null): void {
    this.selectedQueueId.set(queueId);
    this.selectedMatchId.set(null);
  }

  selectChampion(championId: number | null): void {
    this.selectedChampionId.set(championId);
    this.selectedMatchId.set(null);
  }

  selectResult(result: 'all' | 'win' | 'loss'): void {
    this.selectedResult.set(result);
    this.selectedMatchId.set(null);
  }

  selectPlatform(platform: RiotPlatform): void {
    this.selectedPlatform.set(platform);
  }

  viewPlayer(riotId: { gameName: string; tagLine: string }): void {
    this.search({ ...riotId, platform: this.state().player?.server.platform ?? this.selectedPlatform() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadMore(): void {
    const player = this.state().player;
    if (!player || !player.hasMoreMatches || this.loadingMore()) return;

    const searchVersion = this.searchVersion;
    const start = this.nextMatchStart;
    this.loadingMore.set(true);
    this.loadMoreError.set('');
    this.playerService.findMatches(player.account.puuid, start, player.server.platform).subscribe({
      next: (page) => {
        if (searchVersion !== this.searchVersion) return;
        this.nextMatchStart = start + page.matches.length;
        this.state.update((current) => {
          if (!current.player) return current;
          const loadedIds = new Set(current.player.matches.map(({ id }) => id));
          const newMatches = page.matches.filter(({ id }) => !loadedIds.has(id));
          return {
            ...current,
            player: {
              ...current.player,
              matches: [...current.player.matches, ...newMatches],
              hasMoreMatches: page.hasMore
            }
          };
        });
        this.loadingMore.set(false);
      },
      error: (error: unknown) => {
        if (searchVersion !== this.searchVersion) return;
        this.loadMoreError.set(this.getErrorMessage(error));
        this.loadingMore.set(false);
      }
    });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as ApiErrorResponse | undefined;
      return body?.error?.message ?? 'Verifique se a API está ativa e tente novamente.';
    }
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }
}

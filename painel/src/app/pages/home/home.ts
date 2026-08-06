import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { LucideActivity, LucideChartNoAxesColumnIncreasing, LucideRadar, LucideSearch, LucideUserRoundSearch } from '@lucide/angular';
import { MatchCard } from '../../components/match-card/match-card';
import { MatchDetailsPanel } from '../../components/match-details-panel/match-details-panel';
import { PlayerSearch } from '../../components/player-search/player-search';
import { PlayerSummary } from '../../components/player-summary/player-summary';
import { UiState } from '../../components/ui-state/ui-state';
import type { ApiErrorResponse } from '../../models/player.model';
import type { SearchState } from '../../models/search-state.model';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-home',
  imports: [
    LucideActivity,
    LucideChartNoAxesColumnIncreasing,
    LucideRadar,
    LucideSearch,
    LucideUserRoundSearch,
    MatchCard,
    MatchDetailsPanel,
    PlayerSearch,
    PlayerSummary,
    UiState
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private readonly playerService = inject(PlayerService);
  private lastSearch: { gameName: string; tagLine: string } | null = null;

  readonly state = signal<SearchState>({ status: 'idle', player: null, errorMessage: '' });
  readonly selectedMatchId = signal<string | null>(null);

  search(riotId: { gameName: string; tagLine: string }): void {
    this.selectedMatchId.set(null);
    this.lastSearch = riotId;
    this.state.set({ status: 'loading', player: null, errorMessage: '' });
    this.playerService.findByRiotId(riotId.gameName, riotId.tagLine)
      .subscribe({
        next: (player) => {
          const status = player.matches.length ? 'success' : 'empty';
          this.state.set({ status, player, errorMessage: '' });
        },
        error: (error: unknown) => {
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

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as ApiErrorResponse | undefined;
      return body?.error?.message ?? 'Verifique se a API está ativa e tente novamente.';
    }
    if (error instanceof Error && error.name === 'TimeoutError') {
      return 'A consulta demorou mais de 20 segundos. Verifique o terminal da API.';
    }
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }
}

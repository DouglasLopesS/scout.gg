import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  signal,
  SimpleChanges
} from '@angular/core';
import { LucideClock3, LucideRotateCcw } from '@lucide/angular';
import { map, Subscription, switchMap } from 'rxjs';
import type { GameAssetCatalog } from '../../models/game-assets.model';
import type {
  MatchDetails,
  MatchParticipantDetails,
  MatchTeamDetails
} from '../../models/match-details.model';
import { DataDragonAssetsService } from '../../services/data-dragon-assets.service';
import { MatchDetailsService } from '../../services/match-details.service';
import { formatDuration } from '../../shared/format.utils';
import type { RiotPlatform, RiotRegion } from '../../shared/riot-routing';
import { ParticipantRow } from '../participant-row/participant-row';
import { StatusBadge } from '../status-badge/status-badge';
import { TeamSummary } from '../team-summary/team-summary';

type PanelState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-match-details-panel',
  imports: [
    DatePipe,
    LucideClock3,
    LucideRotateCcw,
    ParticipantRow,
    StatusBadge,
    TeamSummary
  ],
  templateUrl: './match-details-panel.html',
  styleUrl: './match-details-panel.scss'
})
export class MatchDetailsPanel implements AfterViewInit, OnChanges, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly detailsService = inject(MatchDetailsService);
  private readonly assetsService = inject(DataDragonAssetsService);
  private request?: Subscription;

  @Input({ required: true }) matchId = '';
  @Input({ required: true }) playerPuuid = '';
  @Input({ required: true }) platform!: RiotPlatform;
  @Input({ required: true }) region!: RiotRegion;
  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly playerSelected = new EventEmitter<{ gameName: string; tagLine: string }>();

  readonly state = signal<PanelState>('loading');
  readonly details = signal<MatchDetails | null>(null);
  readonly catalog = signal<GameAssetCatalog | null>(null);
  readonly errorMessage = signal('');
  readonly formatDuration = formatDuration;

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['matchId'] || changes['platform'] || changes['region']) && this.matchId && this.platform && this.region) this.load();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.host.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  ngOnDestroy(): void {
    this.request?.unsubscribe();
  }

  close(): void {
    this.closed.emit();
  }

  retry(): void {
    this.load();
  }

  team(side: 'blue' | 'red'): MatchTeamDetails | undefined {
    return this.details()?.teams.find((team) => team.side === side);
  }

  participants(teamId: number): MatchParticipantDetails[] {
    return this.details()?.participants.filter((participant) => participant.teamId === teamId) ?? [];
  }

  searchedPlayer(): MatchParticipantDetails | undefined {
    return this.details()?.participants.find(({ puuid }) => puuid === this.playerPuuid);
  }

  selectParticipant(riotId: { gameName: string; tagLine: string }): void {
    this.playerSelected.emit(riotId);
  }

  private load(): void {
    this.request?.unsubscribe();
    this.state.set('loading');
    this.details.set(null);
    this.catalog.set(null);
    this.errorMessage.set('');

    this.request = this.detailsService.findById(this.matchId, this.platform, this.region).pipe(
      switchMap((details) => this.assetsService.getCatalog(details.dataDragonVersion)
        .pipe(map((catalog) => [details, catalog] as const)))
    ).subscribe({
      next: ([details, catalog]) => {
        this.details.set(details);
        this.catalog.set(catalog);
        this.state.set('success');
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.getErrorMessage(error));
        this.state.set('error');
      }
    });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as { error?: { message?: string } } | undefined;
      if (body?.error?.message) return body.error.message;
      if (error.status === 404) return 'A partida não foi encontrada.';
      if (error.status === 429) return 'O limite de consultas foi atingido. Aguarde um momento e tente novamente.';
    }
    return 'Não foi possível carregar os detalhes desta partida. Tente novamente.';
  }
}

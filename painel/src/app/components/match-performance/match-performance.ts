import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { MatchSummary } from '../../shared/match-summary';
import { formatNumber } from '../../shared/format.utils';

@Component({
  selector: 'app-match-performance',
  templateUrl: './match-performance.html',
  styleUrl: './match-performance.scss'
})
export class MatchPerformance {
  @Input({ required: true }) summary!: MatchSummary;
  @Input({ required: true }) totalMatches!: number;
  @Input({ required: true }) queues!: ReadonlyArray<{ id: number; name: string }>;
  @Input({ required: true }) champions!: ReadonlyArray<{ id: number; name: string }>;
  @Input() selectedQueueId: number | null = null;
  @Input() selectedChampionId: number | null = null;
  @Input() selectedResult: 'all' | 'win' | 'loss' = 'all';
  @Output() readonly queueSelected = new EventEmitter<number | null>();
  @Output() readonly championSelected = new EventEmitter<number | null>();
  @Output() readonly resultSelected = new EventEmitter<'all' | 'win' | 'loss'>();
  readonly formatNumber = formatNumber;

  selectQueue(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.queueSelected.emit(value === 'all' ? null : Number(value));
  }

  selectChampion(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.championSelected.emit(value === 'all' ? null : Number(value));
  }

  selectResult(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'all' || value === 'win' || value === 'loss') {
      this.resultSelected.emit(value);
    }
  }
}

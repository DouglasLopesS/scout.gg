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
  @Input() selectedQueueId: number | null = null;
  @Output() readonly queueSelected = new EventEmitter<number | null>();
  readonly formatNumber = formatNumber;

  selectQueue(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.queueSelected.emit(value === 'all' ? null : Number(value));
  }
}

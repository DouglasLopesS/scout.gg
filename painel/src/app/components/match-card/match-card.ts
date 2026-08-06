import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideChevronRight, LucideClock3 } from '@lucide/angular';
import type { PlayerMatch } from '../../models/player.model';
import { formatDuration, formatNumber } from '../../shared/format.utils';
import { type BadgeTone, StatusBadge } from '../status-badge/status-badge';

@Component({
  selector: 'app-match-card',
  imports: [DatePipe, LucideChevronRight, LucideClock3, StatusBadge],
  templateUrl: './match-card.html',
  styleUrl: './match-card.scss'
})
export class MatchCard {
  @Input({ required: true }) match!: PlayerMatch;
  @Input() selected = false;
  @Output() readonly viewDetails = new EventEmitter<string>();
  readonly formatDuration = formatDuration;
  readonly formatNumber = formatNumber;

  queueTone(): BadgeTone {
    const queue = this.match.queueName.toLowerCase();
    if (queue.includes('ranqueada')) return 'warning';
    if (queue.includes('aram')) return 'info';
    return 'neutral';
  }

  openDetails(): void {
    this.viewDetails.emit(this.match.id);
  }
}

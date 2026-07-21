import { Component, Input } from '@angular/core';
import { LucideTrendingUp, LucideTrophy } from '@lucide/angular';
import type { Player } from '../../models/player.model';
import { StatusBadge } from '../status-badge/status-badge';

@Component({
  selector: 'app-player-summary',
  imports: [LucideTrendingUp, LucideTrophy, StatusBadge],
  templateUrl: './player-summary.html',
  styleUrl: './player-summary.scss'
})
export class PlayerSummary {
  @Input({ required: true }) player!: Player;

  rankLabel(): string {
    return this.player.rank ? `${this.player.rank.tier} ${this.player.rank.division}` : 'Não ranqueado';
  }
}

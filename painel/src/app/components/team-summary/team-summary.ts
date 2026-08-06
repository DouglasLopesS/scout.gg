import { Component, Input } from '@angular/core';
import { LucideCoins, LucideCrown, LucideFlame, LucideLandmark, LucideSkull, LucideTowerControl } from '@lucide/angular';
import type { MatchTeamDetails } from '../../models/match-details.model';
import { formatNumber } from '../../shared/format.utils';
import { StatusBadge } from '../status-badge/status-badge';

@Component({
  selector: 'app-team-summary',
  imports: [LucideCoins, LucideCrown, LucideFlame, LucideLandmark, LucideSkull, LucideTowerControl, StatusBadge],
  templateUrl: './team-summary.html',
  styleUrl: './team-summary.scss'
})
export class TeamSummary {
  @Input({ required: true }) team!: MatchTeamDetails;
  @Input() mirrored = false;
  readonly formatNumber = formatNumber;
}

import { Component, computed, input, signal } from '@angular/core';
import type { PlayerMatch } from '../../models/player.model';
import { buildMatchTrends, type TrendChart, type TrendPoint } from '../../shared/match-trends';

interface ActivePoint {
  chartKey: TrendChart['key'];
  matchId: string;
  label: string;
}

@Component({
  selector: 'app-match-trends',
  templateUrl: './match-trends.html',
  styleUrl: './match-trends.scss'
})
export class MatchTrends {
  readonly matches = input.required<readonly PlayerMatch[]>();
  readonly analyzedCount = computed(() => Math.min(10, this.matches().length));
  readonly charts = computed(() => buildMatchTrends(this.matches()));
  private readonly hoveredPoint = signal<ActivePoint | null>(null);
  private readonly selectedPoint = signal<ActivePoint | null>(null);
  readonly activePoint = computed(() => {
    const active = this.hoveredPoint() ?? this.selectedPoint();
    return active && this.charts().some((chart) =>
      chart.key === active.chartKey && chart.points.some((point) => point.matchId === active.matchId)
    ) ? active : null;
  });

  showPoint(chartKey: TrendChart['key'], point: TrendPoint): void {
    this.hoveredPoint.set({ chartKey, matchId: point.matchId, label: point.label });
  }

  hidePoint(): void {
    this.hoveredPoint.set(null);
  }

  togglePoint(chartKey: TrendChart['key'], point: TrendPoint): void {
    const current = this.selectedPoint();
    this.selectedPoint.set(current?.chartKey === chartKey && current.matchId === point.matchId
      ? null
      : { chartKey, matchId: point.matchId, label: point.label });
  }
}

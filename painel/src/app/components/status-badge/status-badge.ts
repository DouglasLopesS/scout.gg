import { Component, Input } from '@angular/core';

export type BadgeTone = 'success' | 'danger' | 'info' | 'warning' | 'neutral';

@Component({
  selector: 'app-status-badge',
  template: '<span class="badge" [class]="\'badge badge--\' + tone"><ng-content />{{ label }}</span>',
  styleUrl: './status-badge.scss'
})
export class StatusBadge {
  @Input() label = '';
  @Input() tone: BadgeTone = 'neutral';
}

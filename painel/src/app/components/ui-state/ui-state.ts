import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideCircleAlert, LucideRadar, LucideRefreshCw, LucideSearch } from '@lucide/angular';

@Component({
  selector: 'app-ui-state',
  imports: [LucideCircleAlert, LucideRadar, LucideRefreshCw, LucideSearch],
  templateUrl: './ui-state.html',
  styleUrl: './ui-state.scss'
})
export class UiState {
  @Input({ required: true }) type!: 'loading' | 'empty' | 'error';
  @Input() title = '';
  @Input() message = '';
  @Output() readonly retry = new EventEmitter<void>();
}

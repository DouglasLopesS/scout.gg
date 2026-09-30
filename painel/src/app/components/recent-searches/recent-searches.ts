import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { PlayerSearchRequest } from '../../shared/riot-routing';

@Component({
  selector: 'app-recent-searches',
  templateUrl: './recent-searches.html',
  styleUrl: './recent-searches.scss'
})
export class RecentSearches {
  @Input({ required: true }) searches!: readonly PlayerSearchRequest[];
  @Input() loading = false;
  @Output() readonly searchSelected = new EventEmitter<PlayerSearchRequest>();
  @Output() readonly cleared = new EventEmitter<void>();
}

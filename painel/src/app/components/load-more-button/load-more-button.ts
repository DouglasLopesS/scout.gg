import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-load-more-button',
  templateUrl: './load-more-button.html',
  styleUrl: './load-more-button.scss'
})
export class LoadMoreButton {
  @Input() loading = false;
  @Input() errorMessage = '';
  @Output() readonly loadMore = new EventEmitter<void>();
}

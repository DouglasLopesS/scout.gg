import { Component, ElementRef, HostListener, Input, inject } from '@angular/core';

let tooltipSequence = 0;

@Component({
  selector: 'app-game-asset-tooltip',
  templateUrl: './game-asset-tooltip.html',
  styleUrl: './game-asset-tooltip.scss'
})
export class GameAssetTooltip {
  private readonly element = inject(ElementRef<HTMLElement>);

  @Input({ required: true }) title = '';
  @Input() description = '';
  @Input() metadata: string[] = [];

  readonly tooltipId = `asset-tooltip-${++tooltipSequence}`;
  open = false;

  toggle(event: Event): void {
    event.stopPropagation();
    this.open = !this.open;
  }

  @HostListener('document:click', ['$event'])
  closeFromOutside(event: Event): void {
    if (!this.element.nativeElement.contains(event.target as Node)) this.open = false;
  }
}

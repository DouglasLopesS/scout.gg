import { Component, Input } from '@angular/core';
import type { GameAssetCatalog, ItemAsset } from '../../models/game-assets.model';
import { GameAssetTooltip } from '../game-asset-tooltip/game-asset-tooltip';

@Component({
  selector: 'app-item-icon',
  imports: [GameAssetTooltip],
  templateUrl: './item-icon.html',
  styleUrl: './item-icon.scss'
})
export class ItemIcon {
  @Input({ required: true }) itemId = 0;
  @Input({ required: true }) catalog!: GameAssetCatalog;

  get item(): ItemAsset | undefined {
    return this.catalog.items.get(this.itemId);
  }

  get metadata(): string[] {
    const item = this.item;
    return item ? [`Custo total: ${item.totalCost}`, ...item.attributes] : [];
  }
}

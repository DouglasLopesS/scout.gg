import { Component, Input } from '@angular/core';
import type { GameAssetCatalog, RuneAsset } from '../../models/game-assets.model';
import { GameAssetTooltip } from '../game-asset-tooltip/game-asset-tooltip';

@Component({
  selector: 'app-rune-icon',
  imports: [GameAssetTooltip],
  templateUrl: './rune-icon.html',
  styleUrl: './rune-icon.scss'
})
export class RuneIcon {
  @Input({ required: true }) runeId: number | null = null;
  @Input({ required: true }) catalog!: GameAssetCatalog;

  get rune(): RuneAsset | undefined {
    return this.runeId === null ? undefined : this.catalog.runes.get(this.runeId);
  }
}

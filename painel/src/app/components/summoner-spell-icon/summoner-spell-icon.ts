import { Component, Input } from '@angular/core';
import type { GameAssetCatalog, SummonerSpellAsset } from '../../models/game-assets.model';
import { GameAssetTooltip } from '../game-asset-tooltip/game-asset-tooltip';

@Component({
  selector: 'app-summoner-spell-icon',
  imports: [GameAssetTooltip],
  templateUrl: './summoner-spell-icon.html',
  styleUrl: './summoner-spell-icon.scss'
})
export class SummonerSpellIcon {
  @Input({ required: true }) spellId = 0;
  @Input({ required: true }) catalog!: GameAssetCatalog;

  get spell(): SummonerSpellAsset | undefined {
    return this.catalog.spells.get(this.spellId);
  }

  get metadata(): string[] {
    const cooldown = this.spell?.cooldown;
    return cooldown ? [`Tempo de recarga: ${cooldown}s`] : [];
  }
}

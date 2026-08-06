import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import type { GameAssetCatalog } from '../../models/game-assets.model';
import type { MatchParticipantDetails } from '../../models/match-details.model';
import { DataDragonAssetsService } from '../../services/data-dragon-assets.service';
import { formatNumber } from '../../shared/format.utils';
import { ItemIcon } from '../item-icon/item-icon';
import { RuneIcon } from '../rune-icon/rune-icon';
import { SummonerSpellIcon } from '../summoner-spell-icon/summoner-spell-icon';

@Component({
  selector: 'app-participant-row',
  imports: [ItemIcon, RuneIcon, SummonerSpellIcon],
  templateUrl: './participant-row.html',
  styleUrl: './participant-row.scss'
})
export class ParticipantRow {
  private readonly assets = inject(DataDragonAssetsService);

  @Input({ required: true }) participant!: MatchParticipantDetails;
  @Input({ required: true }) version = '';
  @Input({ required: true }) catalog!: GameAssetCatalog;
  @Input() highlighted = false;
  @Input() mirrored = false;
  @Output() readonly playerSelected = new EventEmitter<{ gameName: string; tagLine: string }>();

  readonly formatNumber = formatNumber;

  get riotId(): string {
    return this.participant.riotIdTagline
      ? `${this.participant.riotIdGameName}#${this.participant.riotIdTagline}`
      : this.participant.riotIdGameName;
  }

  get championIcon(): string {
    return this.assets.championIcon(this.version, this.participant.championName);
  }

  get mainItemIds(): number[] {
    return [
      this.participant.item0,
      this.participant.item1,
      this.participant.item2,
      this.participant.item3,
      this.participant.item4,
      this.participant.item5
    ];
  }

  get trinketId(): number {
    return this.participant.item6;
  }

  openPlayer(): void {
    if (!this.participant.riotIdTagline) return;
    this.playerSelected.emit({
      gameName: this.participant.riotIdGameName,
      tagLine: this.participant.riotIdTagline
    });
  }

  selectFromRow(event: MouseEvent): void {
    if ((event.target as Element).closest('button')) return;
    this.openPlayer();
  }
}

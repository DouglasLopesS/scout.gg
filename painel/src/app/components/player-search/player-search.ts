import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideSearch } from '@lucide/angular';
import { isRiotPlatform, RIOT_SERVERS, type PlayerSearchRequest, type RiotPlatform } from '../../shared/riot-routing';

@Component({
  selector: 'app-player-search',
  imports: [ReactiveFormsModule, LucideSearch],
  templateUrl: './player-search.html',
  styleUrl: './player-search.scss'
})
export class PlayerSearch {
  @Input() loading = false;
  @Input() platform: RiotPlatform = 'br1';
  @Input() set value(value: string) {
    if (value && value !== this.riotId.value) {
      this.riotId.setValue(value, { emitEvent: false });
    }
  }
  @Output() readonly searchPlayer = new EventEmitter<PlayerSearchRequest>();
  @Output() readonly platformSelected = new EventEmitter<RiotPlatform>();

  readonly servers = RIOT_SERVERS;

  readonly riotId = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^.{3,16}#[^#]{3,5}$/)]
  });

  submit(): void {
    this.riotId.markAsTouched();
    if (this.riotId.invalid || this.loading) {
      return;
    }
    const separator = this.riotId.value.lastIndexOf('#');
    const parsedRiotId = {
      gameName: this.riotId.value.slice(0, separator).trim(),
      tagLine: this.riotId.value.slice(separator + 1).trim(),
      platform: this.platform
    };
    this.searchPlayer.emit(parsedRiotId);
  }

  selectPlatform(event: Event): void {
    const platform = (event.target as HTMLSelectElement).value;
    if (!isRiotPlatform(platform)) return;
    this.platform = platform;
    this.platformSelected.emit(platform);
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideSearch } from '@lucide/angular';

@Component({
  selector: 'app-player-search',
  imports: [ReactiveFormsModule, LucideSearch],
  templateUrl: './player-search.html',
  styleUrl: './player-search.scss'
})
export class PlayerSearch {
  @Input() loading = false;
  @Input() set value(value: string) {
    if (value && value !== this.riotId.value) {
      this.riotId.setValue(value, { emitEvent: false });
    }
  }
  @Output() readonly searchPlayer = new EventEmitter<{ gameName: string; tagLine: string }>();

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
      tagLine: this.riotId.value.slice(separator + 1).trim()
    };
    this.searchPlayer.emit(parsedRiotId);
  }
}

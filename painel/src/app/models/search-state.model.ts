import type { Player } from './player.model';

export type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface SearchState {
  status: SearchStatus;
  player: Player | null;
  errorMessage: string;
}

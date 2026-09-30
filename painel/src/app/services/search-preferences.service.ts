import { computed, Injectable, signal } from '@angular/core';
import { isRiotPlatform, type PlayerSearchRequest, type RiotPlatform } from '../shared/riot-routing';

const STORAGE_KEY = 'scout.gg.search-preferences.v1';
const MAX_RECENT_SEARCHES = 5;

interface SearchPreferences {
  platform: RiotPlatform;
  recentSearches: PlayerSearchRequest[];
}

const DEFAULT_PREFERENCES: SearchPreferences = { platform: 'br1', recentSearches: [] };

function isSearchRequest(value: unknown): value is PlayerSearchRequest {
  if (typeof value !== 'object' || value === null) return false;
  const search = value as Record<string, unknown>;
  return typeof search['gameName'] === 'string'
    && search['gameName'].trim().length >= 3
    && search['gameName'].trim().length <= 16
    && !search['gameName'].includes('#')
    && typeof search['tagLine'] === 'string'
    && /^[^#]{3,5}$/.test(search['tagLine'].trim())
    && typeof search['platform'] === 'string'
    && isRiotPlatform(search['platform']);
}

function searchKey(search: PlayerSearchRequest): string {
  return `${search.platform}:${search.gameName.toLowerCase()}:${search.tagLine.toLowerCase()}`;
}

@Injectable({ providedIn: 'root' })
export class SearchPreferencesService {
  private readonly storage = this.getStorage();
  private readonly preferences = signal<SearchPreferences>(this.read());

  readonly platform = computed(() => this.preferences().platform);
  readonly recentSearches = computed(() => this.preferences().recentSearches);

  selectPlatform(platform: RiotPlatform): void {
    this.update({ ...this.preferences(), platform });
  }

  rememberSearch(search: PlayerSearchRequest): void {
    const normalized = {
      gameName: search.gameName.trim(),
      tagLine: search.tagLine.trim(),
      platform: search.platform
    };
    const key = searchKey(normalized);
    const recentSearches = [normalized, ...this.recentSearches().filter((item) => searchKey(item) !== key)]
      .slice(0, MAX_RECENT_SEARCHES);
    this.update({ platform: normalized.platform, recentSearches });
  }

  clearRecentSearches(): void {
    this.update({ ...this.preferences(), recentSearches: [] });
  }

  private update(value: SearchPreferences): void {
    this.preferences.set(value);
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // O armazenamento pode estar indisponível; a preferência segue ativa nesta sessão.
    }
  }

  private read(): SearchPreferences {
    try {
      const raw = this.storage?.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_PREFERENCES;
      const stored: unknown = JSON.parse(raw);
      if (typeof stored !== 'object' || stored === null) return DEFAULT_PREFERENCES;
      const value = stored as Record<string, unknown>;
      const platform = typeof value['platform'] === 'string' && isRiotPlatform(value['platform'])
        ? value['platform']
        : DEFAULT_PREFERENCES.platform;
      const recentSearches = Array.isArray(value['recentSearches'])
        ? value['recentSearches'].filter(isSearchRequest).slice(0, MAX_RECENT_SEARCHES)
        : [];
      return { platform, recentSearches };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  private getStorage(): Storage | null {
    try {
      return typeof window === 'undefined' ? null : window.localStorage;
    } catch {
      return null;
    }
  }
}

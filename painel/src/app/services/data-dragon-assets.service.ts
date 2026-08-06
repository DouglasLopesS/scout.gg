import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, shareReplay, throwError } from 'rxjs';
import type {
  GameAssetCatalog,
  ItemAsset,
  RuneAsset,
  SummonerSpellAsset
} from '../models/game-assets.model';

interface DataDragonImage { full: string }
interface DataDragonItem {
  name: string;
  description: string;
  image: DataDragonImage;
  gold: { total: number };
  stats: Record<string, number>;
}
interface DataDragonSpell {
  key: string;
  name: string;
  description: string;
  cooldownBurn: string;
  image: DataDragonImage;
}
interface DataDragonRune { id: number; name: string; longDesc?: string; icon: string }
interface DataDragonRuneStyle extends DataDragonRune {
  slots: Array<{ runes: DataDragonRune[] }>;
}

@Injectable({ providedIn: 'root' })
export class DataDragonAssetsService {
  private readonly http = inject(HttpClient);
  private readonly catalogs = new Map<string, Observable<GameAssetCatalog>>();

  getCatalog(version: string): Observable<GameAssetCatalog> {
    const cached = this.catalogs.get(version);
    if (cached) return cached;

    const request = forkJoin({
      items: this.http.get<{ data: Record<string, DataDragonItem> }>(`${this.dataUrl(version)}/item.json`),
      spells: this.http.get<{ data: Record<string, DataDragonSpell> }>(`${this.dataUrl(version)}/summoner.json`),
      runes: this.http.get<DataDragonRuneStyle[]>(`${this.dataUrl(version)}/runesReforged.json`)
    }).pipe(
      map(({ items, spells, runes }) => ({
        items: this.mapItems(version, items.data),
        spells: this.mapSpells(version, spells.data),
        runes: this.mapRunes(runes)
      })),
      catchError((error: unknown) => {
        this.catalogs.delete(version);
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.catalogs.set(version, request);
    return request;
  }

  championIcon(version: string, championName: string): string {
    return `${this.cdn(version)}/img/champion/${encodeURIComponent(championName)}.png`;
  }

  private mapItems(version: string, data: Record<string, DataDragonItem>): ReadonlyMap<number, ItemAsset> {
    return new Map(Object.entries(data).map(([id, item]) => [Number(id), {
      id: Number(id),
      name: item.name,
      description: this.sanitize(item.description),
      totalCost: item.gold.total,
      attributes: Object.entries(item.stats)
        .filter(([, value]) => value !== 0)
        .slice(0, 5)
        .map(([stat, value]) => `${this.statLabel(stat)}: ${value}`),
      iconUrl: `${this.cdn(version)}/img/item/${item.image.full}`
    }]));
  }

  private mapSpells(
    version: string,
    data: Record<string, DataDragonSpell>
  ): ReadonlyMap<number, SummonerSpellAsset> {
    return new Map(Object.values(data).map((spell) => [Number(spell.key), {
      id: Number(spell.key),
      name: spell.name,
      description: this.sanitize(spell.description),
      cooldown: spell.cooldownBurn,
      iconUrl: `${this.cdn(version)}/img/spell/${spell.image.full}`
    }]));
  }

  private mapRunes(styles: DataDragonRuneStyle[]): ReadonlyMap<number, RuneAsset> {
    const runes = new Map<number, RuneAsset>();
    styles.forEach((style) => {
      runes.set(style.id, this.toRuneAsset(style));
      style.slots.flatMap(({ runes: slotRunes }) => slotRunes).forEach((rune) => {
        runes.set(rune.id, this.toRuneAsset(rune));
      });
    });
    return runes;
  }

  private toRuneAsset(rune: DataDragonRune): RuneAsset {
    return {
      id: rune.id,
      name: rune.name,
      description: this.sanitize(rune.longDesc),
      iconUrl: `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`
    };
  }

  private sanitize(value: string | undefined): string {
    if (!value) return '';
    const document = new DOMParser().parseFromString(value, 'text/html');
    return (document.body.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  private statLabel(stat: string): string {
    const labels: Readonly<Record<string, string>> = {
      FlatHPPoolMod: 'Vida',
      FlatMPPoolMod: 'Mana',
      FlatPhysicalDamageMod: 'Dano de ataque',
      FlatMagicDamageMod: 'Poder de habilidade',
      FlatArmorMod: 'Armadura',
      FlatSpellBlockMod: 'Resistência mágica',
      PercentAttackSpeedMod: 'Velocidade de ataque',
      PercentMovementSpeedMod: 'Velocidade de movimento'
    };
    return labels[stat] ?? stat.replace(/([A-Z])/g, ' $1').trim();
  }

  private dataUrl(version: string): string {
    return `${this.cdn(version)}/data/pt_BR`;
  }

  private cdn(version: string): string {
    return `https://ddragon.leagueoflegends.com/cdn/${version}`;
  }
}

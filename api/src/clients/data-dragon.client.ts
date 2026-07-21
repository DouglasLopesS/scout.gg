import axios, { AxiosError } from 'axios';
import { AppError } from '../utils/app-error.js';

interface DataDragonImage { full: string }
interface DataDragonSpell { key: string; image: DataDragonImage }
interface DataDragonRune { id: number; icon: string }
interface DataDragonRuneStyle extends DataDragonRune {
  slots: Array<{ runes: DataDragonRune[] }>;
}

export interface DataDragonCatalog {
  spellIcons: ReadonlyMap<number, string>;
  runeIcons: ReadonlyMap<number, string>;
}

export class DataDragonClient {
  private version: string | undefined;
  private catalog: DataDragonCatalog | undefined;

  async getLatestVersion(): Promise<string> {
    if (this.version) {
      return this.version;
    }

    try {
      const { data } = await axios.get<string[]>('https://ddragon.leagueoflegends.com/api/versions.json', {
        timeout: 8_000
      });
      const latest = data[0];
      if (!latest) {
        throw new Error('Data Dragon não retornou uma versão.');
      }
      this.version = latest;
      return latest;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new AppError(502, 'Não foi possível carregar os recursos do jogo.', 'DATA_DRAGON_ERROR');
      }
      throw error;
    }
  }

  async getCatalog(version: string): Promise<DataDragonCatalog> {
    if (this.catalog) {
      return this.catalog;
    }
    try {
      const [spellsResponse, runesResponse] = await Promise.all([
        axios.get<{ data: Record<string, DataDragonSpell> }>(
          `${this.cdn(version)}/data/en_US/summoner.json`, { timeout: 8_000 }
        ),
        axios.get<DataDragonRuneStyle[]>(
          `${this.cdn(version)}/data/en_US/runesReforged.json`, { timeout: 8_000 }
        )
      ]);
      const spellIcons = new Map<number, string>();
      Object.values(spellsResponse.data.data).forEach((spell) => {
        spellIcons.set(Number(spell.key), `${this.cdn(version)}/img/spell/${spell.image.full}`);
      });
      const runeIcons = new Map<number, string>();
      runesResponse.data.forEach((style) => {
        runeIcons.set(style.id, `https://ddragon.leagueoflegends.com/cdn/img/${style.icon}`);
        style.slots.flatMap(({ runes }) => runes).forEach((rune) => {
          runeIcons.set(rune.id, `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`);
        });
      });
      this.catalog = { spellIcons, runeIcons };
      return this.catalog;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new AppError(502, 'Não foi possível carregar os recursos do jogo.', 'DATA_DRAGON_ERROR');
      }
      throw error;
    }
  }

  profileIcon(version: string, id: number): string {
    return `${this.cdn(version)}/img/profileicon/${id}.png`;
  }

  championIcon(version: string, championName: string): string {
    return `${this.cdn(version)}/img/champion/${encodeURIComponent(championName)}.png`;
  }

  championSplash(championName: string): string {
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${encodeURIComponent(championName)}_0.jpg`;
  }

  item(version: string, id: number): string {
    return `${this.cdn(version)}/img/item/${id}.png`;
  }

  private cdn(version: string): string {
    return `https://ddragon.leagueoflegends.com/cdn/${version}`;
  }
}

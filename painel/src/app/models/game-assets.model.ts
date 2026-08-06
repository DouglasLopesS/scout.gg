export interface ItemAsset {
  id: number;
  name: string;
  description: string;
  totalCost: number;
  attributes: string[];
  iconUrl: string;
}

export interface RuneAsset {
  id: number;
  name: string;
  description: string;
  iconUrl: string;
}

export interface SummonerSpellAsset {
  id: number;
  name: string;
  description: string;
  cooldown: string;
  iconUrl: string;
}

export interface GameAssetCatalog {
  items: ReadonlyMap<number, ItemAsset>;
  runes: ReadonlyMap<number, RuneAsset>;
  spells: ReadonlyMap<number, SummonerSpellAsset>;
}

import type { PlayerMatch } from '../models/player.model';

export interface ChampionSummary {
  id: number;
  name: string;
  icon: string;
  games: number;
  wins: number;
}

export interface MatchSummary {
  games: number;
  wins: number;
  winRate: number;
  averageKda: number;
  csPerMinute: number;
  averageDamage: number;
  champions: ChampionSummary[];
}

export function summarizeMatches(matches: readonly PlayerMatch[]): MatchSummary {
  const champions = new Map<number, ChampionSummary>();
  let wins = 0;
  let kills = 0;
  let deaths = 0;
  let assists = 0;
  let cs = 0;
  let durationSeconds = 0;
  let damage = 0;

  for (const match of matches) {
    if (match.win) wins++;
    kills += match.kda.kills;
    deaths += match.kda.deaths;
    assists += match.kda.assists;
    damage += match.damageToChampions;

    if (match.durationSeconds > 0) {
      cs += match.cs;
      durationSeconds += match.durationSeconds;
    }

    const champion = champions.get(match.champion.id);
    if (champion) {
      champion.games++;
      if (match.win) champion.wins++;
    } else {
      champions.set(match.champion.id, {
        id: match.champion.id,
        name: match.champion.name,
        icon: match.assets.championIcon,
        games: 1,
        wins: match.win ? 1 : 0
      });
    }
  }

  const games = matches.length;
  return {
    games,
    wins,
    winRate: games ? Math.round((wins / games) * 100) : 0,
    averageKda: games ? (kills + assists) / Math.max(1, deaths) : 0,
    csPerMinute: durationSeconds ? cs / (durationSeconds / 60) : 0,
    averageDamage: games ? damage / games : 0,
    champions: [...champions.values()]
      .sort((a, b) => b.games - a.games || b.wins - a.wins || a.name.localeCompare(b.name, 'pt-BR'))
      .slice(0, 3)
  };
}

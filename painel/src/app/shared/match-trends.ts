import type { PlayerMatch } from '../models/player.model';

export interface TrendPoint {
  matchId: string;
  x: number;
  y: number;
  label: string;
}

export interface TrendChart {
  key: 'kda' | 'cs' | 'damage';
  title: string;
  description: string;
  topLabel: string;
  latestLabel: string;
  points: TrendPoint[];
  line: string;
}

const decimal = (digits: number): Intl.NumberFormat =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

const wholeNumber = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

const metrics = [
  {
    key: 'kda',
    title: 'KDA',
    description: 'Relação KDA por partida',
    value: (match: PlayerMatch) => match.kda.ratio,
    format: (value: number) => decimal(2).format(value)
  },
  {
    key: 'cs',
    title: 'CS/min',
    description: 'Farm por minuto em cada partida',
    value: (match: PlayerMatch) => match.durationSeconds > 0
      ? match.cs * 60 / match.durationSeconds
      : null,
    format: (value: number) => decimal(1).format(value)
  },
  {
    key: 'damage',
    title: 'Dano',
    description: 'Dano a campeões por partida',
    value: (match: PlayerMatch) => match.damageToChampions,
    format: (value: number) => wholeNumber.format(value)
  }
] as const;

export function buildMatchTrends(matches: readonly PlayerMatch[]): TrendChart[] {
  const recent = [...matches]
    .sort((a, b) => Date.parse(b.playedAt) - Date.parse(a.playedAt))
    .slice(0, 10)
    .reverse();

  return metrics.map((metric) => {
    const samples = recent.map((match, index) => ({
      match,
      index,
      value: metric.value(match)
    })).filter((sample): sample is typeof sample & { value: number } =>
      sample.value !== null && Number.isFinite(sample.value) && sample.value >= 0
    );
    const maxValue = Math.max(1, ...samples.map(({ value }) => value));
    const points = samples.map(({ match, index, value }) => {
      const x = recent.length === 1 ? 200 : 20 + index * 360 / (recent.length - 1);
      const y = 130 - value / maxValue * 110;
      const date = new Date(match.playedAt).toLocaleDateString('pt-BR');
      return {
        matchId: match.id,
        x,
        y,
        label: `${date}, ${match.champion.name}: ${metric.format(value)} ${metric.title}`
      };
    });

    return {
      key: metric.key,
      title: metric.title,
      description: metric.description,
      topLabel: metric.format(maxValue),
      latestLabel: samples.length ? metric.format(samples[samples.length - 1].value) : '—',
      points,
      line: points.map(({ x, y }) => `${x},${y}`).join(' ')
    };
  });
}

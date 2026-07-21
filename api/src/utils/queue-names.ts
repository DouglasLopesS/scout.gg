const QUEUE_NAMES: Readonly<Record<number, string>> = {
  0: 'Personalizada',
  400: 'Normal Draft',
  420: 'Ranqueada Solo/Duo',
  430: 'Normal Blind',
  440: 'Ranqueada Flex',
  450: 'ARAM',
  490: 'Quickplay',
  700: 'Clash',
  830: 'Co-op vs IA',
  840: 'Co-op vs IA',
  850: 'Co-op vs IA',
  900: 'URF',
  1020: 'One for All',
  1300: 'Nexus Blitz',
  1700: 'Arena',
  1710: 'Arena',
  1810: 'Swarm'
};

export const getQueueName = (queueId: number): string => QUEUE_NAMES[queueId] ?? `Fila ${queueId}`;

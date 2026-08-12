export type ZwrPlayerCount = 1 | 2 | 3 | 4;

export interface ZwrPlayer {
  name: string;
  profileUrl?: string;
}

export interface ZwrEntry {
  rank: number;
  players: ZwrPlayer[];
  round: number;
  platform?: string;
  evidenceUrl?: string;
}

export type ZwrBoards = Record<ZwrPlayerCount, ZwrEntry[]>;

export interface ZwrMapBoard {
  mapId: string;
  sourceUrl: string;
  fetchedAt: string;
  live: boolean;
  boards: ZwrBoards;
}

export type ZwrFallbackFile = Record<string, ZwrMapBoard>;

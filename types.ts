
export interface AnimalEntry {
  name: string;
  baseName: string;
  rarity: string;
  generation: number;
  mutation: string;
  traits: string[];
  slot: string;
  plot: string;
  scannedAt: string;
}

export interface PlayerData {
  userId: number;
  username: string;
  animals: AnimalEntry[];
}

export interface BrainrotJson {
  lastUpdate: string;
  players: PlayerData[];
}

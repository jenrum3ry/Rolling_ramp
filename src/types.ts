export type Tier = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Exotic' | 'Mythical' | 'Celestial';

export interface Aura {
  id: string;
  name: string;
  chance: number; // 1 in X
  tier: Tier;
  color: string;
  description?: string;
}

export interface Gauntlet {
  id: string;
  name: string;
  requirements: Record<string, number>;
  reward: { luck?: number; speed?: number };
  description: string;
}

export interface Potion {
  id: string;
  name: string;
  requirements: Record<string, number>;
  effect: { luck: number; duration: number }; // duration in rolls
  description: string;
}

export interface GameState {
  totalRolls: number;
  totalStats: number;
  baseLuck: number;
  effectiveLuck: number;
  inventory: Record<string, number>;
  bestAura: Aura | null;
  unlockedGauntlets: string[];
  activePotions: { id: string; remainingRolls: number }[];
  discoveredAuras: string[];
  blessingActive: boolean;
  blessingCooldown: number; // timestamp
}

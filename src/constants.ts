import { Aura, Gauntlet, Potion } from './types';

export const AURAS: Aura[] = [
  { id: 'ordinary', name: 'Ordinary', chance: 2, tier: 'Common', color: 'text-gray-400' },
  { id: 'surge', name: 'Surge', chance: 10, tier: 'Common', color: 'text-gray-300' },
  { id: 'ice', name: 'Ice', chance: 50, tier: 'Rare', color: 'text-blue-300' },
  { id: 'neon', name: 'Neon', chance: 100, tier: 'Rare', color: 'text-green-400' },
  { id: 'helix', name: 'Helix', chance: 250, tier: 'Epic', color: 'text-indigo-400' },
  { id: 'sky', name: 'Sky', chance: 500, tier: 'Epic', color: 'text-sky-400' },
  { id: 'scorched', name: 'Scorched', chance: 1000, tier: 'Epic', color: 'text-orange-600' },
  { id: 'nova', name: 'Nova', chance: 2500, tier: 'Legendary', color: 'text-yellow-400' },
  { id: 'radiance', name: 'Radiance', chance: 5000, tier: 'Legendary', color: 'text-yellow-200' },
  { id: 'flame', name: 'Flame', chance: 10000, tier: 'Legendary', color: 'text-red-500' },
  { id: 'bounded', name: 'Bounded', chance: 25000, tier: 'Exotic', color: 'text-purple-600' },
  { id: 'vortex', name: 'Vortex', chance: 50000, tier: 'Exotic', color: 'text-indigo-900' },
  { id: 'primordial', name: 'Primordial', chance: 131700, tier: 'Exotic', color: 'text-orange-500' },
  { id: 'mythical', name: 'Mythical', chance: 500000, tier: 'Mythical', color: 'text-emerald-400' },
  { id: 'celestial', name: 'Celestial', chance: 1000000, tier: 'Celestial', color: 'text-white' },
];

export const GAUNTLETS: Gauntlet[] = [
  {
    id: 'sparks',
    name: 'Gauntlet of Sparks',
    requirements: { ordinary: 10, surge: 5 },
    reward: { speed: 0.1 },
    description: '+10% roll speed (while equipped)'
  },
  {
    id: 'storms',
    name: 'Gauntlet of Storms',
    requirements: { ice: 5, neon: 2 },
    reward: { luck: 0.5 },
    description: '+50% luck (while equipped)'
  },
  {
    id: 'abyss',
    name: 'Gauntlet of the Abyss',
    requirements: { helix: 3, sky: 1 },
    reward: { luck: 1.0, speed: 0.25 },
    description: '+100% luck + 25% roll speed'
  }
];

export const POTIONS: Potion[] = [
  {
    id: 'love',
    name: 'Love Potion',
    requirements: { ordinary: 15, surge: 10 },
    effect: { luck: 50, duration: 100 },
    description: 'Grants 50x luck for 100 rolls.'
  },
  {
    id: 'starlight',
    name: 'Starlight Potion',
    requirements: { ice: 5, neon: 3 },
    effect: { luck: 1000, duration: 1 },
    description: 'Grants 1,000x luck for 1 roll.'
  }
];

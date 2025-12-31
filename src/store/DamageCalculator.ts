"use client";
import { create } from 'zustand';

export type ArtifactSlot = 'flower' | 'feather' | 'sands' | 'goblet' | 'circlet';

export type ArtifactMainStat = {
  slot: ArtifactSlot;
  statType: string;
  value: number;
};

export type KQMCConstraint = {
  statType: string;
  constraint: number;
  distributed: number;
};

export type Buff = {
  statType: string;
  uptime: number; // 0-100
  avgStat: number; // calculated
};

export type RotationAction = {
  id: string;
  actionType: string; // 'Infused NA', 'Infused CA', 'Infused P', 'E', 'Q', etc.
  multiplier: number;
  mvPercent: number;
  instances: number;
  damage: number; // calculated
};

export type EnemyConfig = {
  level: number;
  elementalResistance: number; // %
  physicalResistance: number; // %
  defMultiplier: number; // calculated
  elementalResMultiplier: number; // calculated
  physicalResMultiplier: number; // calculated
};

export type TotalStats = {
  baseHP: number;
  hpPercent: number;
  flatHP: number;
  totalHP: number;
  baseATK: number;
  atkPercent: number;
  flatATK: number;
  totalATK: number;
  baseDEF: number;
  defPercent: number;
  flatDEF: number;
  totalDEF: number;
  em: number;
  critRate: number;
  critDamage: number;
  critMultiplier: number;
  energyRecharge: number;
  elementalDMGBonus: number;
  physicalDMGBonus: number;
  normalATKDMGBonus: number;
  chargeATKDMGBonus: number;
  plungeDMGBonus: number;
  skillDMGBonus: number;
  burstDMGBonus: number;
  healingBonus: number;
};

export type CalculatorState = {
  // Character
  characterKey: string;
  characterLevel: number;
  constellation: number; // 0-6
  normalAttackLevel: number; // 1-15
  skillLevel: number; // 1-15
  burstLevel: number; // 1-15
  erRequirements: number; // %

  // Weapon
  weaponKey: string;
  weaponLevel: number; // 1-90
  weaponRefinement: number; // 1-5

  // Artifacts
  artifacts: ArtifactMainStat[];

  // Enemy
  enemy: EnemyConfig;

  // KQMC
  kqmcConstraints: KQMCConstraint[];

  // Buffs
  buffs: Buff[];

  // Rotation
  rotation: RotationAction[];
  rotationDuration: number; // seconds

  // Outputs (calculated)
  totalStats: TotalStats | null;
  dpr: number; // Damage Per Rotation
  dps: number; // Damage Per Second

  // Actions
  setCharacter: (key: string, level: number, constellation: number) => void;
  setTalents: (na: number, skill: number, burst: number) => void;
  setERRequirements: (er: number) => void;
  setWeapon: (key: string, level: number, refinement: number) => void;
  setArtifact: (slot: ArtifactSlot, statType: string, value: number) => void;
  setEnemy: (config: Partial<EnemyConfig>) => void;
  setKQMCConstraint: (statType: string, constraint: number, distributed: number) => void;
  setBuff: (statType: string, uptime: number) => void;
  addRotationAction: (action: Omit<RotationAction, 'id' | 'damage'>) => void;
  updateRotationAction: (id: string, updates: Partial<RotationAction>) => void;
  removeRotationAction: (id: string) => void;
  setRotationDuration: (duration: number) => void;
  setCalculatedResults: (totalStats: TotalStats, dpr: number, dps: number) => void;
  reset: () => void;
};

const initialEnemy: EnemyConfig = {
  level: 100,
  elementalResistance: 10,
  physicalResistance: 10,
  defMultiplier: 0.49,
  elementalResMultiplier: 0.9,
  physicalResMultiplier: 0.9,
};

const initialKQMCStats = [
  'HP%', 'Flat HP', 'ATK%', 'Flat ATK', 'DEF%', 'Flat DEF',
  'EM', 'CR', 'CD', 'ER'
];

const initialBuffTypes = [
  'HP%', 'Flat HP', 'ATK%', 'Flat ATK', 'DEF%', 'Flat DEF',
  'EM', 'CR%', 'CD%', 'ER%', 'DMG%', 'Elemental DMG%',
  'Physical DMG%', 'Normal ATK DMG%', 'Charge ATK DMG%',
  'Plunge DMG%', 'Skill DMG%', 'Burst DMG%', 'Healing Bonus',
  'Def Shred', 'Def Ignore', 'Elemental RES Shred',
  'Phys RES Shred', 'Reaction Bonus'
];

export const useDamageCalculator = create<CalculatorState>((set) => ({
  // Initial state
  characterKey: '',
  characterLevel: 90,
  constellation: 0,
  normalAttackLevel: 9,
  skillLevel: 9,
  burstLevel: 9,
  erRequirements: 100,

  weaponKey: '',
  weaponLevel: 90,
  weaponRefinement: 1,

  artifacts: [],

  enemy: initialEnemy,

  kqmcConstraints: initialKQMCStats.map(stat => ({
    statType: stat,
    constraint: 0,
    distributed: 0,
  })),

  buffs: initialBuffTypes.map(stat => ({
    statType: stat,
    uptime: 0,
    avgStat: 0,
  })),

  rotation: [],
  rotationDuration: 20,

  totalStats: null,
  dpr: 0,
  dps: 0,

  // Actions
  setCharacter: (key, level, constellation) =>
    set({ characterKey: key, characterLevel: level, constellation }),

  setTalents: (na, skill, burst) =>
    set({ normalAttackLevel: na, skillLevel: skill, burstLevel: burst }),

  setERRequirements: (er) => set({ erRequirements: er }),

  setWeapon: (key, level, refinement) =>
    set({ weaponKey: key, weaponLevel: level, weaponRefinement: refinement }),

  setArtifact: (slot, statType, value) =>
    set((state) => {
      const existing = state.artifacts.find(a => a.slot === slot);
      if (existing) {
        return {
          artifacts: state.artifacts.map(a =>
            a.slot === slot ? { slot, statType, value } : a
          ),
        };
      }
      return {
        artifacts: [...state.artifacts, { slot, statType, value }],
      };
    }),

  setEnemy: (config) =>
    set((state) => ({
      enemy: { ...state.enemy, ...config },
    })),

  setKQMCConstraint: (statType, constraint, distributed) =>
    set((state) => ({
      kqmcConstraints: state.kqmcConstraints.map(k =>
        k.statType === statType ? { statType, constraint, distributed } : k
      ),
    })),

  setBuff: (statType, uptime) =>
    set((state) => ({
      buffs: state.buffs.map(b =>
        b.statType === statType ? { ...b, uptime } : b
      ),
    })),

  addRotationAction: (action) =>
    set((state) => ({
      rotation: [
        ...state.rotation,
        {
          ...action,
          id: `${Date.now()}-${Math.random()}`,
          damage: 0,
        },
      ],
    })),

  updateRotationAction: (id, updates) =>
    set((state) => ({
      rotation: state.rotation.map(a =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),

  removeRotationAction: (id) =>
    set((state) => ({
      rotation: state.rotation.filter(a => a.id !== id),
    })),

  setRotationDuration: (duration) => set({ rotationDuration: duration }),

  setCalculatedResults: (totalStats, dpr, dps) =>
    set({ totalStats, dpr, dps }),

  reset: () =>
    set({
      characterKey: '',
      characterLevel: 90,
      constellation: 0,
      normalAttackLevel: 9,
      skillLevel: 9,
      burstLevel: 9,
      erRequirements: 100,
      weaponKey: '',
      weaponLevel: 90,
      weaponRefinement: 1,
      artifacts: [],
      enemy: initialEnemy,
      kqmcConstraints: initialKQMCStats.map(stat => ({
        statType: stat,
        constraint: 0,
        distributed: 0,
      })),
      buffs: initialBuffTypes.map(stat => ({
        statType: stat,
        uptime: 0,
        avgStat: 0,
      })),
      rotation: [],
      rotationDuration: 20,
      totalStats: null,
      dpr: 0,
      dps: 0,
    }),
}));



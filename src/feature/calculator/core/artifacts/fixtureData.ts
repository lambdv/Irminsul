/**
 * Snapshot copied from aminus artifact fixtures.
 * We only keep the 4* lvl16 and 5* lvl20 rows needed by current KQMC modes.
 */

export const MAIN_STAT_VALUES_FIXTURE: Record<number, Record<number, Record<string, number>>> = {
  5: {
    20: {
      FlatHP: 4780,
      FlatATK: 311,
      HPPercent: 0.466,
      ATKPercent: 0.466,
      DEFPercent: 0.583,
      ElementalMastery: 186.5,
      EnergyRecharge: 0.518,
      PyroDMGBonus: 0.466,
      ElectroDMGBonus: 0.466,
      CryoDMGBonus: 0.466,
      HydroDMGBonus: 0.466,
      DendroDMGBonus: 0.466,
      AnemoDMGBonus: 0.466,
      GeoDMGBonus: 0.466,
      PhysicalDMGBonus: 0.583,
      CritRate: 0.311,
      CritDMG: 0.622,
      HealingBonus: 0.359,
    },
  },
  4: {
    16: {
      FlatHP: 1377,
      FlatATK: 90,
      HPPercent: 0.134,
      ATKPercent: 0.134,
      DEFPercent: 0.168,
      ElementalMastery: 53.7,
      EnergyRecharge: 0.149,
      PyroDMGBonus: 0.134,
      ElectroDMGBonus: 0.134,
      CryoDMGBonus: 0.134,
      HydroDMGBonus: 0.134,
      DendroDMGBonus: 0.134,
      AnemoDMGBonus: 0.134,
      GeoDMGBonus: 0.134,
      PhysicalDMGBonus: 0.168,
      CritRate: 0.09,
      CritDMG: 0.179,
      HealingBonus: 0.103,
    },
  },
};

export const SUBSTAT_ROLL_TIERS_FIXTURE: Record<number, Record<string, number[]>> = {
  5: {
    FlatHP: [298.75, 268.88, 239.0, 209.13],
    FlatATK: [19.45, 17.51, 15.56, 13.62],
    FlatDEF: [23.15, 20.83, 18.52, 16.2],
    HPPercent: [0.0583, 0.0525, 0.0466, 0.0408],
    ATKPercent: [0.0583, 0.0525, 0.0466, 0.0408],
    DEFPercent: [0.0729, 0.0656, 0.0583, 0.051],
    ElementalMastery: [23.31, 20.98, 18.65, 16.32],
    EnergyRecharge: [0.0648, 0.0583, 0.0518, 0.0453],
    CritRate: [0.0389, 0.035, 0.0311, 0.0272],
    CritDMG: [0.0777, 0.0699, 0.0622, 0.0544],
    HealingBonus: [0.0473, 0.0426, 0.0379, 0.0332],
  },
  4: {
    FlatHP: [239.0, 215.1, 191.2, 167.3],
    FlatATK: [15.56, 14.0, 12.45, 10.89],
    FlatDEF: [18.52, 16.67, 14.82, 12.96],
    HPPercent: [0.0466, 0.042, 0.0373, 0.0326],
    ATKPercent: [0.0466, 0.042, 0.0373, 0.0326],
    DEFPercent: [0.0583, 0.0525, 0.0466, 0.0408],
    ElementalMastery: [18.65, 16.79, 14.92, 13.06],
    EnergyRecharge: [0.0518, 0.0466, 0.0414, 0.0363],
    CritRate: [0.0311, 0.028, 0.0249, 0.0218],
    CritDMG: [0.0622, 0.056, 0.0497, 0.0435],
    HealingBonus: [0.038, 0.0342, 0.0304, 0.0266],
  },
};

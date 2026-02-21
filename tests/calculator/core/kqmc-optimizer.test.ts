import {
  KqmcOptimizationError,
  RotationPayload,
  optimizeKqmcArtifacts,
} from "@/feature/calculator/core";

const createRotationPayload = (): RotationPayload => ({
  rotation: {
    id: "rotation",
    actions: [
      {
        id: "action-1",
        label: "Action 1",
        element: "Pyro",
        damageType: "Skill",
        motionValue: 2,
        instances: 2,
        scaling: "ATK",
        amplifier: "None",
        buffTableNodeIds: ["buff1"],
      },
    ],
  },
  buffTablesById: {
    buff1: {
      SkillDMGBonus: 0.2,
    },
  },
});

describe("kqmc artifact optimizer", () => {
  test("optimizes 5-star KQMC artifacts and returns finite stat tables", () => {
    const result = optimizeKqmcArtifacts({
      base: {
        BaseATK: 1000,
        ATKPercent: 0.5,
        FlatATK: 200,
        CritRate: 0.6,
        CritDMG: 1.2,
        PyroDMGBonus: 0.4,
        EnergyRecharge: 1.0,
      },
      rotationPayload: createRotationPayload(),
      energyRechargeRequirement: 1.2,
      mode: "5-star",
    });

    expect(result.mode).toBe("5-star");
    expect(result.rows).toHaveLength(10);
    expect(Number.isFinite(result.damage)).toBe(true);
    expect(result.damage).toBeGreaterThan(0);
    expect(Number.isFinite(result.combined.BaseATK || 0)).toBe(true);
    expect((result.combined.EnergyRecharge || 0) >= 1.2).toBe(true);
    expect(result.totalDistributedExtra).toBeGreaterThanOrEqual(0);
  });

  test("throws typed error when ER target cannot be met", () => {
    expect(() =>
      optimizeKqmcArtifacts({
        base: {
          BaseATK: 800,
          CritRate: 0.5,
          CritDMG: 1.0,
          EnergyRecharge: 1.0,
        },
        rotationPayload: createRotationPayload(),
        energyRechargeRequirement: 10,
        mode: "5-star",
      }),
    ).toThrow(KqmcOptimizationError);

    try {
      optimizeKqmcArtifacts({
        base: {
          BaseATK: 800,
          CritRate: 0.5,
          CritDMG: 1.0,
          EnergyRecharge: 1.0,
        },
        rotationPayload: createRotationPayload(),
        energyRechargeRequirement: 10,
        mode: "5-star",
      });
    } catch (error) {
      expect(error instanceof KqmcOptimizationError).toBe(true);
      expect((error as KqmcOptimizationError).code).toBe("UNMET_ER");
    }
  });

  test("keeps distributed extra rolls within per-stat constraints", () => {
    const result = optimizeKqmcArtifacts({
      base: {
        BaseATK: 1000,
        ATKPercent: 0.5,
        FlatATK: 300,
        CritRate: 0.5,
        CritDMG: 1.1,
        EnergyRecharge: 1.1,
      },
      rotationPayload: createRotationPayload(),
      energyRechargeRequirement: 1.1,
      mode: "4+1",
      fiveStarSlot: "goblet",
    });

    let accumulatedExtra = 0;
    for (const row of result.rows) {
      expect(row.distributedExtra).toBeLessThanOrEqual(row.constraint);
      accumulatedExtra += row.distributedExtra;
    }

    expect(accumulatedExtra).toBe(result.totalDistributedExtra);
  });

  test("treats missing ER stat in base table as 1.0 baseline", () => {
    const result = optimizeKqmcArtifacts({
      base: {
        BaseATK: 1000,
        ATKPercent: 0.5,
        FlatATK: 200,
        CritRate: 0.5,
        CritDMG: 1.0,
      },
      rotationPayload: createRotationPayload(),
      energyRechargeRequirement: 1.3,
      mode: "5-star",
    });

    expect((result.combined.EnergyRecharge || 0) >= 1.3).toBe(true);
    expect(result.damage).toBeGreaterThan(0);
  });
});

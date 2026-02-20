import { executeRotation } from "@/feature/calculator/core";

describe("calculator rotation engine", () => {
  test("executeRotation returns sum of actions", () => {
    const base = {
      BaseATK: 1200,
      ATKPercent: 0.4,
      FlatATK: 200,
      CritRate: 0.6,
      CritDMG: 1.2,
      PyroDMGBonus: 0.4,
    };

    const total = executeRotation(
      base,
      {
        id: "rot",
        actions: [
          {
            id: "a1",
            label: "Skill",
            element: "Pyro",
            damageType: "Skill",
            motionValue: 2,
            buffTableNodeIds: ["buff1"],
          },
          {
            id: "a2",
            label: "Burst",
            element: "Pyro",
            damageType: "Burst",
            motionValue: 4,
            buffTableNodeIds: [],
          },
        ],
      },
      {
        buff1: { SkillDMGBonus: 0.2 },
      },
    );

    expect(Number.isFinite(total)).toBe(true);
    expect(total).toBeGreaterThan(0);
  });

  test("executeRotation ignores unresolved buff ids and warns", () => {
    const warn = jest.fn();
    const total = executeRotation(
      { BaseATK: 1000, CritRate: 0.5, CritDMG: 1, ATKPercent: 0.5 },
      {
        id: "rot",
        actions: [
          {
            id: "a1",
            label: "Normal",
            element: "Physical",
            damageType: "Normal",
            motionValue: 1,
            buffTableNodeIds: ["missing"],
          },
        ],
      },
      {},
      { warn },
    );

    expect(total).toBeGreaterThan(0);
    expect(warn).toHaveBeenCalled();
  });
});


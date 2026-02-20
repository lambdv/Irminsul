import { DamageActionSpec, RotationSpec } from "./types";

const withActionDefaults = (action: DamageActionSpec): DamageActionSpec => ({
  ...action,
  instances:
    Number.isFinite(action.instances) && (action.instances as number) > 0
      ? Math.floor(action.instances as number)
      : 1,
  scaling: action.scaling ?? "ATK",
  amplifier: action.amplifier ?? "None",
  buffTableNodeIds: action.buffTableNodeIds ?? [],
});

export const createRotationSpec = (
  id: string,
  actions: DamageActionSpec[],
): RotationSpec => ({
  id,
  actions: actions.map(withActionDefaults),
});


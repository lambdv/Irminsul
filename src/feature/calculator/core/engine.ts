import { buildDamageComputeFromSpec } from "./aminusAdapter";
import { createRotationSpec } from "./rotation";
import { StatTableLike, RotationSpec } from "./types";

type Logger = Pick<Console, "warn">;

export const executeRotation = (
  base: StatTableLike,
  rotation: RotationSpec,
  buffTablesById: Record<string, StatTableLike>,
  logger: Logger = console,
): number => {
  const normalized = createRotationSpec(rotation.id, rotation.actions);
  let total = 0;

  for (const action of normalized.actions) {
    const linkedBuffs: StatTableLike[] = [];

    for (const buffId of action.buffTableNodeIds || []) {
      const buff = buffTablesById[buffId];
      if (!buff) {
        logger.warn(
          `[calculator] unresolved buff table id "${buffId}" for action "${action.label || action.id}"`,
        );
        continue;
      }
      linkedBuffs.push(buff);
    }

    total += buildDamageComputeFromSpec(action)(base, linkedBuffs);
  }

  return total;
};


export interface CharacterEnergyData {
    character: string;
    element: string;
    labels: string[];
    particles: (number | null)[];
    flat: (number | null)[];
    variance: string[];
    perSecond: number[];
    duration: (number | null)[];
    cooldown: (number | null)[];
    burstCooldown: number;
    burstEnergy: number;
    burstDiscount: number | null;
    er: number | null;
    helpFlexible: string | null;
    helpFixed: string | null;
    errorFlexible: string | null;
    errorFixed: string | null;
}

/**
 *         {
            "character": "Xiao",
            "element": "Anemo",
            "labels": ["Press", "", ""],
            "particles": [3, null, null],
            "flat": [null, null, null],
            "variance": ["0%", "50%", "50%"],
            "perSecond": [0.00, 0.00, 0.00],
            "duration": [0, null, null],
            "cooldown": [10, null, null],
            "burstCooldown": 18,
            "burstEnergy": 70,
            "burstDiscount": null,
            "er": null,
            "helpFlexible": "Xiao's C1 gives him an extra charge",
            "helpFixed": "Xiao's C1 gives him an extra charge",
            "errorFlexible": null,
            "errorFixed": null
        },
 */

  
export interface EnergyData {
"enemy-particles": {
    default: {
    particles: Record<string, number>;
    energy: Record<string, number>;
    description: string;
    };
    none: {
    particles: Record<string, number>;
    energy: Record<string, number>;
    description: string;
    };
    custom: {
    particles: Record<string, number>;
    energy: Record<string, number>;
    description: string;
    };
};
field: {
    onfield: {
    "right-element": number;
    "no-element": number;
    "left-element": number;
    orb: number;
    "onfield-multiplier": number;
    };
    offfield: {
    "right-element": number;
    "no-element": number;
    "left-element": number;
    orb: number;
    "offfield-multiplier": number;
    };
};
data: Array<{
    character: string;
    element: string;
    labels: string[];
    particles: (number | null)[];
    flat: (number | null)[];
    variance: string[];
    perSecond: number[];
    duration: (number | null)[];
    cooldown: (number | null)[];
    burstCooldown: number;
    burstEnergy: number;
    burstDiscount: number | null;
    er: number | null;
    helpFlexible: string | null;
    helpFixed: string | null;
    errorFlexible: string | null;
    errorFixed: string | null;
}>;
}


export enum ParticleRNGType {
  Average = 'average',
  Safe = 'safe',
  WorseCase = 'worseCase'
}

export type RotationMode = "fixed" | "flexable"

const PARTICLE_RNG_VALUES: Record<ParticleRNGType, number> = {
  [ParticleRNGType.Average]: 0,
  [ParticleRNGType.Safe]: 0.5,
  [ParticleRNGType.WorseCase]: 1
}

export function getParticleRNGValue(type: ParticleRNGType): number {
  return PARTICLE_RNG_VALUES[type]
}

export type CharacterEnergySpec = {
  name: string, //character name
  skillType: string, //Skill uses per rotation (primary type)	
  skillAmount: number,

  skillType2: string, //Skill uses per rotation (secondary type)	
  skillAmount2: number,

  feedTo: string, //Feed particles to ally	
  feedPortion: number, //Proportion of particles fed
  favProcs: number, //Proportion of particles fed
  bonusEnergy: number, //Bonus (non-particle) flat energy per rotation	
  fieldTime: number, //Time on field	
  burstsPerRotation: number, //Number of rotations between bursts	
}
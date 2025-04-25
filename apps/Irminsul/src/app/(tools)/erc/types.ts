export interface Character {
    element: string;
    labels: string[];
    particles: (number | null)[];
    flat: (number | null)[];
    variance: (number | null)[];
    perSecond: (number | null)[];
    duration: (number | null)[];
    cooldown: (number | null)[];
    burstCooldown: number | null;
    burstEnergy: number | null;
    burstDiscount: number | null;
    er: number | null;
    help: {
      flexible: string | null;
      fixed: string | null;
    };
    error: {
      flexible: string | null;
      fixed: string | null;
    };
  }
  
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
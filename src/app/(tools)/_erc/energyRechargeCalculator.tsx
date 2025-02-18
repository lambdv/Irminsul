"use client"
import energyData from '@public/data/energy.json'
const typedEnergyData = energyData as EnergyData;
import React, { useState } from 'react'

interface Character {
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
  
  interface EnergyData {
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

export default function ERC() {

    const [clearTime, setClearTime] = useState(90)
    /**
     * Enemy HP particles
     * Particle RNG
     * Rotation mode
     * Rotation length
  
     */
    const [enemyHPParticles, setEnemyHPParticles] = useState(9)
    const [enemyParticleRNG, setEnemyParticleRNG] = useState(0)
    const [enemyRotationMode, setEnemyRotationMode] = useState(0)
    const [enemyRotationLength, setEnemyRotationLength] = useState(0)

  return (
    <div>
              <h1>Energy Recharge Calculator</h1>
      <div>
        <div>
          <h2>Global Settings</h2>
          <div className='flex flex-col gap-2'>
            <div>
              <label>Clear Time</label>
              <input type="number" value={clearTime} onChange={(e) => setClearTime(Number(e.target.value))} className="text-white bg-[#292929] p-2 rounded-md" />
            </div>
            <div>
              <label>Enemy HP Particles</label>
              <input type="number" value={enemyHPParticles} onChange={(e) => setEnemyHPParticles(Number(e.target.value))} className="text-white bg-[#292929] p-2 rounded-md" />
            </div>
            <div>
              <label>Particle RNG</label>

              <input type="number" value={enemyParticleRNG} onChange={(e) => setEnemyParticleRNG(Number(e.target.value))} className="text-white bg-[#292929] p-2 rounded-md" />
            </div>
            <div>
              <label>Rotation Mode</label>
              <input type="number" value={enemyRotationMode} onChange={(e) => setEnemyRotationMode(Number(e.target.value))} className="text-white bg-[#292929] p-2 rounded-md" />
            </div>
            <div>
              <label>Rotation Length</label>
              <input type="number" value={enemyRotationLength} onChange={(e) => setEnemyRotationLength(Number(e.target.value))} className="text-white bg-[#292929] p-2 rounded-md" />
            </div>
          </div>
        </div>
      




      </div>


    </div>
  )
}

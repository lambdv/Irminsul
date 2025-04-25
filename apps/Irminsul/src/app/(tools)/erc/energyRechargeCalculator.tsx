"use client"
import React, { useState } from 'react'
import energyData from '@public/data/energy.json'
import { EnergyData } from './types'
const typedEnergyData = energyData as EnergyData;

const enum ParticleRNGType {
  Average = 'average',
  Safe = 'safe',
  WorseCase = 'worseCase'
}

const PARTICLE_RNG_VALUES: Record<ParticleRNGType, number> = {
  [ParticleRNGType.Average]: 0,
  [ParticleRNGType.Safe]: 0.5,
  [ParticleRNGType.WorseCase]: 1
}

function getParticleRNGValue(type: ParticleRNGType): number {
  return PARTICLE_RNG_VALUES[type]
}

type CharacterEnergySpec = {
  name: string, //character name
  skillType: string, //Skill uses per rotation (primary type)	
  skillAmount: number,

  skillType2: string, //Skill uses per rotation (secondary type)	
  skillAmount2: number,

  feedTo: string, //Feed particles to ally	
  feedPortion: number, //Proportion of particles fed
  favProcs: number, //Proportion of particles fed
  bonusEnergy: number, //Bonus (non-particle) flat energy per rotation	
  fieldTime, number, //Time on field	
  burstsPerRotation: number, //Number of rotations between bursts	
}


function calculateEnergyRechargeRequirements(
  character: CharacterEnergySpec, 
  params: {
    clearTime: number,
    enemyHPParticles: number,
    particleRNG: ParticleRNGType,
    rotationMode: "fixed" | "flexable",
    rotationLength: number
  }
): number{

  let burstEnergyCost = 0
  let totalEnergyPerBurst = 0
  let burstNonParticalEnergy = 0

  let bonusEnergyRecharge = 0 //mainly for razor
  
  const energyRechargeRequirement = ((burstEnergyCost-burstNonParticalEnergy)/totalEnergyPerBurst) - bonusEnergyRecharge

  if(energyRechargeRequirement > 1)
    return 1

  return energyRechargeRequirement
}

export default function ERC() {

  //high level parmaeters
  const [clearTime, setClearTime] = useState(90)
  const [enemyHPParticles, setEnemyHPParticles] = useState(9) //default, no partical, custom
  const [particleRNG, setParticleRNG] = useState<ParticleRNGType>(ParticleRNGType.Average)
  const [rotationMode, setRotationMode] = useState<"fixed" | "flexable">("fixed")
  const [rotationLength, setRotationLength] = useState(20)

  //character specs
  const [character1, setCharacter1] = useState<CharacterEnergySpec>(null)
  const [character2, setCharacter2] = useState<CharacterEnergySpec>(null)
  const [character3, setCharacter3] = useState<CharacterEnergySpec>(null)
  const [character4, setCharacter4] = useState<CharacterEnergySpec>(null)



  return (
    <div>
      <div>
      </div>
    </div>
  )
}

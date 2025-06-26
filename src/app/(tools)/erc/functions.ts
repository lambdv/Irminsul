//import EnergyDB from '@public/data/energy.json'

const EnergyDB = await fetch('https://cdn.irminsul.moe/data/energy.json').then(res => res.json())
import { CharacterEnergyData, CharacterEnergySpec, ParticleRNGType, RotationMode } from './types'
const CHARACTER_ENERGY_DATA = EnergyDB.data as CharacterEnergyData[]

/**
 * 
 */
export {characterGeneratedEnergy, calculateEnergyRechargeRequirements}

const characterGeneratedEnergy = (characterConfig: CharacterEnergySpec, characterData: CharacterEnergyData): number => {
    //self primary skill
    const selfPrimarySkill = 0

    const particlesPerSecondPrimarySkill = 0

    const primarySkillIsTurret = characterData.perSecond[0] > 0 //terrible way to design this programmtically but this is how its done on the excel sheet

    const turretEnergyPerSecond = 0



    
    
    //self secondary skill
    const selfSecondarySkill = 0

    //self fav procs
    const selfFavProcs = characterConfig.favProcs

    return 0
}

 function calculateEnergyRechargeRequirements(
  params: {
    clearTime: number,
    enemyHPParticles: number,
    particleRNG: ParticleRNGType,
    rotationMode: "fixed" | "flexable",
    rotationLength: number
  },
  characterConfig1: CharacterEnergySpec,
  characterConfig2?: CharacterEnergySpec,
  characterConfig3?: CharacterEnergySpec,
  characterConfig4?: CharacterEnergySpec,
) {
  //get character data
  const characterData = CHARACTER_ENERGY_DATA.find(c => c.character === characterConfig1.name)
  if(!characterData) 
    throw new Error("Character not found")

  //find burst cost
  const burstCost = characterData["burstEnergy"]
  const burstDiscount = characterData["burstDiscount"] || 0

  let burstEnergyCost = burstCost - burstDiscount







  let totalEnergyPerBurst = 0

  //energy generated from self
  




  //energy generated from allies

  //energy generated from hp particles

  //energy from other sources





  let burstNonParticalEnergy = 0

  let bonusEnergyRecharge = 0 //mainly for razor
  
  const energyRechargeRequirement = ((burstEnergyCost-burstNonParticalEnergy)/totalEnergyPerBurst) - bonusEnergyRecharge

  if(energyRechargeRequirement > 1)
    return 1

  return energyRechargeRequirement
}


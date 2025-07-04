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
  const chara1Data = CHARACTER_ENERGY_DATA.find(c => c.character === characterConfig1.name)
  if(!chara1Data) throw new Error("Character not found")

  //find burst cost
  const burstCost = chara1Data["burstEnergy"]
  const burstDiscount = chara1Data["burstDiscount"] || 0

  let burstEnergyCost = burstCost - burstDiscount



  /**
   * energy generated from self
   */

  let chara1TimeBetweenBurst = 0 //todo

  let chara1ParticlesPerSecond = 0

  if (chara1ParticlesPerSecond == 0 || characterConfig1.skillType == "") {
    chara1ParticlesPerSecond = 0
  }
  else{
    
  }

  //character 1 particles per second * time between burst 
  //
  let particlesFromChara1SkillPrimary = chara1ParticlesPerSecond * chara1TimeBetweenBurst
  // if(chara1Data["element"] == "Clear") {
  //   particlesFromChara1SkillPrimary * 2
  // }
  // else{
  //   particlesFromChara1SkillPrimary * (feedFromChara1SkillPrimary * 1 + (1-feedFromChara1SkillPrimary) * 0.6)
  // }


  let particlesFromChara1SkillSecondary
  let particlesFromChara1Fav

  //let energyFromCharacter1ForCharacter1 = particlesFromChara1SkillPrimary + particlesFromChara1SkillSecondary + particlesFromChara1Fav

  //energy generated from allies
  let energyFromCharacter2ForCharacter1 = 0
  let energyFromCharacter3ForCharacter1 = 0
  let energyFromCharacter4ForCharacter1 = 0

  //energy generated from hp particles

  let energyFromHPParticlesForCharacter1 = 0

  //energy from other sources

  let energyFromOtherSourcesForCharacter1 = 0
  

  let totalEnergyPerBurst =  energyFromCharacter2ForCharacter1 + energyFromCharacter3ForCharacter1 + energyFromCharacter4ForCharacter1 + energyFromHPParticlesForCharacter1 + energyFromOtherSourcesForCharacter1 


  let skillUsedPerBurstPrimary = 0

  //hard code dendro traveler 
  if (characterConfig1.name === "Dendro Traveler")
    burstEnergyCost = burstEnergyCost - 3.5 * skillUsedPerBurstPrimary

  let burstNonParticalEnergy = 0

  let bonusNonParticalEnergy = 0

  let bonusEnergyRecharge = 0 //mainly for razor  
  
  //Total energy recharge needed	
  const energyRechargeRequirement = ((burstEnergyCost - bonusNonParticalEnergy) / totalEnergyPerBurst) - bonusEnergyRecharge

  if(energyRechargeRequirement > 1)
    return 1
  return energyRechargeRequirement
}


"use client"
import React, { useState } from 'react'
import { CharacterEnergyData, CharacterEnergySpec, ParticleRNGType, RotationMode } from './types'

export default function ERC() {

  //high level parmaeters
  const [clearTime, setClearTime] = useState(90)
  const [enemyHPParticles, setEnemyHPParticles] = useState(9) //default, no partical, custom
  const [particleRNG, setParticleRNG] = useState<ParticleRNGType>(ParticleRNGType.Average)
  const [rotationMode, setRotationMode] = useState<RotationMode>("fixed")
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

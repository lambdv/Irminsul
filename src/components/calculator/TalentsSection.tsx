"use client";
import React from 'react';
import { useDamageCalculator } from '@/store/DamageCalculator';
import CalculatorInput from './CalculatorInput';
import styles from './calculator.module.css';

export default function TalentsSection() {
  const {
    normalAttackLevel,
    skillLevel,
    burstLevel,
    setTalents,
  } = useDamageCalculator();

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Talents</h3>
      
      <CalculatorInput
        label="Normal Attack"
        type="number"
        value={normalAttackLevel}
        onChange={(val) => setTalents(val as number, skillLevel, burstLevel)}
        min={1}
        max={15}
      />

      <CalculatorInput
        label="Elemental Skill"
        type="number"
        value={skillLevel}
        onChange={(val) => setTalents(normalAttackLevel, val as number, burstLevel)}
        min={1}
        max={15}
      />

      <CalculatorInput
        label="Elemental Burst"
        type="number"
        value={burstLevel}
        onChange={(val) => setTalents(normalAttackLevel, skillLevel, val as number)}
        min={1}
        max={15}
      />
    </div>
  );
}



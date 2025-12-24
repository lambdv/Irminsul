"use client";
import React, { useEffect } from 'react';
import { useDamageCalculator } from '@/store/DamageCalculator';
import CalculatorInput from './CalculatorInput';
import styles from './calculator.module.css';

export default function EnemySection() {
  const { enemy, setEnemy } = useDamageCalculator();

  // Calculate multipliers based on enemy level and resistances
  useEffect(() => {
    // DEF Multiplier formula: (Character Level + 100) / (Character Level + 100 + Enemy Level + 100)
    // Simplified: assuming character level 90
    const charLevel = 90;
    const defMultiplier = (charLevel + 100) / (charLevel + 100 + enemy.level + 100);
    
    // RES Multiplier: if RES < 0, use 1 - RES/2; if RES >= 0, use 1 - RES
    const elementalResMultiplier = enemy.elementalResistance < 0
      ? 1 - enemy.elementalResistance / 2
      : 1 - enemy.elementalResistance / 100;
    
    const physicalResMultiplier = enemy.physicalResistance < 0
      ? 1 - enemy.physicalResistance / 2
      : 1 - enemy.physicalResistance / 100;

    setEnemy({
      defMultiplier,
      elementalResMultiplier: Math.max(0.1, elementalResMultiplier), // Clamp to 0.1 minimum
      physicalResMultiplier: Math.max(0.1, physicalResMultiplier), // Clamp to 0.1 minimum
    });
  }, [enemy.level, enemy.elementalResistance, enemy.physicalResistance, setEnemy]);

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Enemy</h3>
      
      <CalculatorInput
        label="Level"
        type="number"
        value={enemy.level}
        onChange={(val) => setEnemy({ level: val as number })}
        min={1}
        max={100}
      />

      <CalculatorInput
        label="Elemental Resistance (%)"
        type="number"
        value={enemy.elementalResistance}
        onChange={(val) => setEnemy({ elementalResistance: val as number })}
        min={-100}
        max={100}
      />

      <CalculatorInput
        label="Physical Resistance (%)"
        type="number"
        value={enemy.physicalResistance}
        onChange={(val) => setEnemy({ physicalResistance: val as number })}
        min={-100}
        max={100}
      />

      <div className={styles.statsDisplay}>
        <div className={styles.statRow}>
          <span>DEF Multiplier:</span>
          <span>{enemy.defMultiplier.toFixed(2)}</span>
        </div>
        <div className={styles.statRow}>
          <span>Elemental RES Multiplier:</span>
          <span>{(enemy.elementalResMultiplier * 100).toFixed(0)}%</span>
        </div>
        <div className={styles.statRow}>
          <span>Physical RES Multiplier:</span>
          <span>{(enemy.physicalResMultiplier * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}



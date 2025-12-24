"use client";
import React from 'react';
import { useDamageCalculator } from '@/store/DamageCalculator';
import CalculatorInput from './CalculatorInput';
import styles from './calculator.module.css';

export default function OutputSection() {
  const {
    dpr,
    dps,
    rotationDuration,
    setRotationDuration,
  } = useDamageCalculator();

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Output</h3>
      
      <CalculatorInput
        label="Rot(s)"
        type="number"
        value={rotationDuration}
        onChange={(val) => setRotationDuration(val as number)}
        min={1}
        step={0.1}
      />

      <div className={styles.outputDisplay}>
        <div className={styles.outputRow}>
          <span>DPR:</span>
          <span className={styles.outputValue}>{dpr.toFixed(0)}</span>
        </div>
        <div className={styles.outputRow}>
          <span>DPS:</span>
          <span className={styles.outputValue}>{dps.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}



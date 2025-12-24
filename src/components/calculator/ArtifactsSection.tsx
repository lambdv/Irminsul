"use client";
import React from 'react';
import { useDamageCalculator, ArtifactSlot } from '@/store/DamageCalculator';
import CalculatorInput from './CalculatorInput';
import styles from './calculator.module.css';

const artifactSlots: { slot: ArtifactSlot; label: string; mainStats: string[] }[] = [
  {
    slot: 'flower',
    label: 'Flower',
    mainStats: ['Flat HP'],
  },
  {
    slot: 'feather',
    label: 'Feather',
    mainStats: ['Flat ATK'],
  },
  {
    slot: 'sands',
    label: 'Sands',
    mainStats: ['HP%', 'ATK%', 'DEF%', 'EM', 'ER%'],
  },
  {
    slot: 'goblet',
    label: 'Goblet',
    mainStats: ['HP%', 'ATK%', 'DEF%', 'EM', 'Elemental DMG%', 'Physical DMG%'],
  },
  {
    slot: 'circlet',
    label: 'Circlet',
    mainStats: ['HP%', 'ATK%', 'DEF%', 'EM', 'CR%', 'CD%', 'Healing Bonus'],
  },
];

export default function ArtifactsSection() {
  const { artifacts, setArtifact } = useDamageCalculator();

  const getArtifactValue = (slot: ArtifactSlot) => {
    const artifact = artifacts.find(a => a.slot === slot);
    return artifact?.statType || '';
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Artifacts</h3>
      
      {artifactSlots.map(({ slot, label, mainStats }) => (
        <CalculatorInput
          key={slot}
          label={label}
          type="select"
          value={getArtifactValue(slot)}
          onChange={(val) => {
            // For now, we'll set a placeholder value
            // In a real implementation, you'd calculate the actual value based on artifact level
            setArtifact(slot, val as string, 0);
          }}
          options={[
            { value: '', label: 'None' },
            ...mainStats.map(stat => ({
              value: stat,
              label: stat,
            })),
          ]}
        />
      ))}
    </div>
  );
}



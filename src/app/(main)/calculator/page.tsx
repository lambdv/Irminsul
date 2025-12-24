"use client";
import React, { useCallback, useEffect, useRef } from 'react';
import { useDamageCalculator } from '@/store/DamageCalculator';
import CharacterSection from '@/components/calculator/CharacterSection';
import WeaponSection from '@/components/calculator/WeaponSection';
import ArtifactsSection from '@/components/calculator/ArtifactsSection';
import TalentsSection from '@/components/calculator/TalentsSection';
import EnemySection from '@/components/calculator/EnemySection';
import KQMCSection from '@/components/calculator/KQMCSection';
import BuffsSection from '@/components/calculator/BuffsSection';
import TotalStatsSection from '@/components/calculator/TotalStatsSection';
import RotationSection from '@/components/calculator/RotationSection';
import OutputSection from '@/components/calculator/OutputSection';
import styles from '@/components/calculator/calculator.module.css';

export default function CalculatorPage() {
  const calculatorState = useDamageCalculator();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const calculate = useCallback(async () => {
    try {
      const response = await fetch('/api/calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterKey: calculatorState.characterKey,
          characterLevel: calculatorState.characterLevel,
          constellation: calculatorState.constellation,
          weaponKey: calculatorState.weaponKey,
          weaponLevel: calculatorState.weaponLevel,
          weaponRefinement: calculatorState.weaponRefinement,
          artifacts: calculatorState.artifacts,
          enemy: calculatorState.enemy,
          kqmcConstraints: calculatorState.kqmcConstraints,
          buffs: calculatorState.buffs,
          rotation: calculatorState.rotation,
          rotationDuration: calculatorState.rotationDuration,
        }),
      });

      if (!response.ok) {
        throw new Error('Calculation failed');
      }

      const data = await response.json();
      calculatorState.setCalculatedResults(
        data.totalStats,
        data.dpr || 0,
        data.dps || 0
      );
    } catch (error) {
      console.error('Calculation error:', error);
    }
  }, [calculatorState]);

  // Debounced calculation
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Only calculate if we have character and weapon selected
    if (calculatorState.characterKey && calculatorState.weaponKey) {
      debounceTimer.current = setTimeout(() => {
        calculate();
      }, 500);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [
    calculatorState.characterKey,
    calculatorState.characterLevel,
    calculatorState.constellation,
    calculatorState.weaponKey,
    calculatorState.weaponLevel,
    calculatorState.weaponRefinement,
    calculatorState.artifacts,
    calculatorState.enemy,
    calculatorState.kqmcConstraints,
    calculatorState.buffs,
    calculatorState.rotation,
    calculatorState.rotationDuration,
    calculate,
  ]);

  return (
    <div className={styles.calculatorContainer}>
      {/* Left Column */}
      <div className={styles.leftColumn}>
        <CharacterSection />
        <WeaponSection />
        <ArtifactsSection />
        <TalentsSection />
        <EnemySection />
      </div>

      {/* Middle Column */}
      <div className={styles.middleColumn}>
        <KQMCSection />
        <BuffsSection />
      </div>

      {/* Right Column */}
      <div className={styles.rightColumn}>
        <TotalStatsSection />
        <RotationSection />
        <OutputSection />
      </div>
    </div>
  );
}



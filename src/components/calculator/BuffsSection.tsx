"use client";
import React, { useEffect } from 'react';
import { useDamageCalculator } from '@/store/DamageCalculator';
import CalculatorTable from './CalculatorTable';
import CalculatorInput from './CalculatorInput';
import styles from './calculator.module.css';

export default function BuffsSection() {
  const { buffs, setBuff } = useDamageCalculator();

  // Calculate average stat based on uptime
  useEffect(() => {
    buffs.forEach((buff) => {
      // This is a simplified calculation - in reality, avgStat would be calculated
      // based on the actual buff value and uptime percentage
      // For now, we'll just store the uptime as a placeholder
    });
  }, [buffs]);

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Buffs</h3>
      
      <CalculatorTable
        header={
          <>
            <th>Stat</th>
            <th>Uptime (%)</th>
            <th>Avg Stat</th>
          </>
        }
        body={buffs.map((buff, index) => (
          <tr key={index}>
            <td>{buff.statType}</td>
            <td>
              <CalculatorInput
                type="number"
                value={buff.uptime}
                onChange={(val) => setBuff(buff.statType, val as number)}
                min={0}
                max={100}
                className={styles.inlineInput}
              />
            </td>
            <td>{buff.avgStat.toFixed(2)}</td>
          </tr>
        ))}
      />
    </div>
  );
}



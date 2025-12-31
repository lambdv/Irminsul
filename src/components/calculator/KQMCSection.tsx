"use client";
import React from 'react';
import { useDamageCalculator } from '@/store/DamageCalculator';
import CalculatorTable from './CalculatorTable';
import CalculatorInput from './CalculatorInput';
import styles from './calculator.module.css';

export default function KQMCSection() {
  const { kqmcConstraints, setKQMCConstraint } = useDamageCalculator();

  const totalConstraint = kqmcConstraints.reduce((sum, c) => sum + c.constraint, 0);
  const totalDistributed = kqmcConstraints.reduce((sum, c) => sum + c.distributed, 0);

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>KQMC (Constraint Distributed Stats)</h3>
      
      <CalculatorTable
        header={
          <>
            <th>Stat</th>
            <th>Constraint</th>
            <th>Distributed Stats</th>
            <th>Value</th>
          </>
        }
        body={kqmcConstraints.map((constraint, index) => (
          <tr key={index}>
            <td>{constraint.statType}</td>
            <td>
              <CalculatorInput
                type="number"
                value={constraint.constraint}
                onChange={(val) =>
                  setKQMCConstraint(constraint.statType, val as number, constraint.distributed)
                }
                min={0}
                className={styles.inlineInput}
              />
            </td>
            <td>
              <CalculatorInput
                type="number"
                value={constraint.distributed}
                onChange={(val) =>
                  setKQMCConstraint(constraint.statType, constraint.constraint, val as number)
                }
                min={0}
                className={styles.inlineInput}
              />
            </td>
            <td>
              {constraint.constraint > 0
                ? `${constraint.constraint}%`
                : constraint.distributed > 0
                ? `${constraint.distributed}`
                : '0'}
            </td>
          </tr>
        ))}
      />

      <div className={styles.summaryRow}>
        <span>Total:</span>
        <span>Constraint: {totalConstraint}</span>
        <span>Distributed: {totalDistributed}</span>
      </div>
    </div>
  );
}



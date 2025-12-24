"use client";
import React from 'react';
import { useDamageCalculator } from '@/store/DamageCalculator';
import CalculatorTable from './CalculatorTable';
import CalculatorInput from './CalculatorInput';
import styles from './calculator.module.css';

const actionTypes = [
  'Infused NA',
  'Infused CA',
  'Infused P',
  'E',
  'Q',
  '1.5x Amplifying',
  '2x Amplifying',
  'Overload',
  'Shatter',
  'Electro Charged',
  'Swirl',
  '1.5x Amp Swirl',
  '2x Amp Swirl',
  'Superconduct',
  'Burning',
  'Bloom',
  'Hyperbloom',
  'Burgeon',
  'Aggravate',
  'Spread',
];

export default function RotationSection() {
  const {
    rotation,
    addRotationAction,
    updateRotationAction,
    removeRotationAction,
  } = useDamageCalculator();

  const handleAddAction = () => {
    addRotationAction({
      actionType: 'Infused NA',
      multiplier: 0,
      mvPercent: 0,
      instances: 0,
    });
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Rotation</h3>
      
      <button onClick={handleAddAction} className={styles.addButton}>
        Add Action
      </button>

      <CalculatorTable
        header={
          <>
            <th>Instance</th>
            <th>Multiplier</th>
            <th>MV%</th>
            <th>Instances</th>
            <th>DMG</th>
            <th>Actions</th>
          </>
        }
        body={rotation.map((action, index) => (
          <tr key={action.id}>
            <td>
              <CalculatorInput
                type="select"
                value={action.actionType}
                onChange={(val) =>
                  updateRotationAction(action.id, { actionType: val as string })
                }
                options={actionTypes.map(type => ({
                  value: type,
                  label: type,
                }))}
                className={styles.inlineInput}
              />
            </td>
            <td>
              <CalculatorInput
                type="number"
                value={action.multiplier}
                onChange={(val) =>
                  updateRotationAction(action.id, { multiplier: val as number })
                }
                step={0.01}
                className={styles.inlineInput}
              />
            </td>
            <td>
              <CalculatorInput
                type="number"
                value={action.mvPercent}
                onChange={(val) =>
                  updateRotationAction(action.id, { mvPercent: val as number })
                }
                step={0.01}
                className={styles.inlineInput}
              />
            </td>
            <td>
              <CalculatorInput
                type="number"
                value={action.instances}
                onChange={(val) =>
                  updateRotationAction(action.id, { instances: val as number })
                }
                min={0}
                step={1}
                className={styles.inlineInput}
              />
            </td>
            <td>{action.damage.toFixed(0)}</td>
            <td>
              <button
                onClick={() => removeRotationAction(action.id)}
                className={styles.removeButton}
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
      />
    </div>
  );
}


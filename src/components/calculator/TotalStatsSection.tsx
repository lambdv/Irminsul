"use client";
import React from 'react';
import { useDamageCalculator } from '@/store/DamageCalculator';
import styles from './calculator.module.css';

export default function TotalStatsSection() {
  const { totalStats } = useDamageCalculator();

  if (!totalStats) {
    return (
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Total Stats</h3>
        <p className={styles.emptyState}>Calculate to see total stats</p>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Total Stats</h3>
      
      <div className={styles.statsDisplay}>
        <div className={styles.statGroup}>
          <h4>HP</h4>
          <div className={styles.statRow}>
            <span>Base HP:</span>
            <span>{totalStats.baseHP.toFixed(0)}</span>
          </div>
          <div className={styles.statRow}>
            <span>HP%:</span>
            <span>{totalStats.hpPercent.toFixed(1)}%</span>
          </div>
          <div className={styles.statRow}>
            <span>Flat HP:</span>
            <span>{totalStats.flatHP.toFixed(0)}</span>
          </div>
          <div className={styles.statRow}>
            <span>Total HP:</span>
            <span>{totalStats.totalHP.toFixed(0)}</span>
          </div>
        </div>

        <div className={styles.statGroup}>
          <h4>ATK</h4>
          <div className={styles.statRow}>
            <span>Base ATK:</span>
            <span>{totalStats.baseATK.toFixed(0)}</span>
          </div>
          <div className={styles.statRow}>
            <span>ATK%:</span>
            <span>{totalStats.atkPercent.toFixed(1)}%</span>
          </div>
          <div className={styles.statRow}>
            <span>Flat ATK:</span>
            <span>{totalStats.flatATK.toFixed(0)}</span>
          </div>
          <div className={styles.statRow}>
            <span>Total ATK:</span>
            <span>{totalStats.totalATK.toFixed(0)}</span>
          </div>
        </div>

        <div className={styles.statGroup}>
          <h4>DEF</h4>
          <div className={styles.statRow}>
            <span>Base DEF:</span>
            <span>{totalStats.baseDEF.toFixed(0)}</span>
          </div>
          <div className={styles.statRow}>
            <span>DEF%:</span>
            <span>{totalStats.defPercent.toFixed(1)}%</span>
          </div>
          <div className={styles.statRow}>
            <span>Flat DEF:</span>
            <span>{totalStats.flatDEF.toFixed(0)}</span>
          </div>
          <div className={styles.statRow}>
            <span>Total DEF:</span>
            <span>{totalStats.totalDEF.toFixed(0)}</span>
          </div>
        </div>

        <div className={styles.statGroup}>
          <h4>Other Stats</h4>
          <div className={styles.statRow}>
            <span>EM:</span>
            <span>{totalStats.em.toFixed(0)}</span>
          </div>
          <div className={styles.statRow}>
            <span>Crit Rate:</span>
            <span>{totalStats.critRate.toFixed(1)}%</span>
          </div>
          <div className={styles.statRow}>
            <span>Crit Damage:</span>
            <span>{totalStats.critDamage.toFixed(1)}%</span>
          </div>
          <div className={styles.statRow}>
            <span>Crit Multiplier:</span>
            <span>{totalStats.critMultiplier.toFixed(2)}</span>
          </div>
          <div className={styles.statRow}>
            <span>Energy Recharge:</span>
            <span>{totalStats.energyRecharge.toFixed(1)}%</span>
          </div>
        </div>

        <div className={styles.statGroup}>
          <h4>DMG Bonuses</h4>
          <div className={styles.statRow}>
            <span>Elemental DMG%:</span>
            <span>{totalStats.elementalDMGBonus.toFixed(1)}%</span>
          </div>
          <div className={styles.statRow}>
            <span>Physical DMG%:</span>
            <span>{totalStats.physicalDMGBonus.toFixed(1)}%</span>
          </div>
          <div className={styles.statRow}>
            <span>Normal ATK DMG%:</span>
            <span>{totalStats.normalATKDMGBonus.toFixed(1)}%</span>
          </div>
          <div className={styles.statRow}>
            <span>Charge ATK DMG%:</span>
            <span>{totalStats.chargeATKDMGBonus.toFixed(1)}%</span>
          </div>
          <div className={styles.statRow}>
            <span>Plunge DMG%:</span>
            <span>{totalStats.plungeDMGBonus.toFixed(1)}%</span>
          </div>
          <div className={styles.statRow}>
            <span>Skill DMG%:</span>
            <span>{totalStats.skillDMGBonus.toFixed(1)}%</span>
          </div>
          <div className={styles.statRow}>
            <span>Burst DMG%:</span>
            <span>{totalStats.burstDMGBonus.toFixed(1)}%</span>
          </div>
          <div className={styles.statRow}>
            <span>Healing Bonus:</span>
            <span>{totalStats.healingBonus.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}



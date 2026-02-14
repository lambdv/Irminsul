"use client"
import React, { useEffect, useMemo, useState } from "react"
import { useDamageCalculator } from "@/store/DamageCalculator"
import { Weapon } from "@/types/weapon"
import CalculatorInput from "./CalculatorInput"
import styles from "./calculator.module.css"

export default function WeaponSection() {
  const { weaponKey, weaponLevel, weaponRefinement, setWeapon } =
    useDamageCalculator()

  const [weapons, setWeapons] = useState<Weapon[]>([])

  useEffect(() => {
    fetch("/api/weapons")
      .then((res) => res.json())
      .then((data) => setWeapons(data.data || []))
      .catch((err) => console.error("Failed to fetch weapons:", err))
  }, [])

  const selectedWeapon = useMemo(() => {
    if (!weaponKey) return null
    return (
      weapons.find((w) => w.key === weaponKey || w.id === weaponKey) || null
    )
  }, [weaponKey, weapons])

  const handleWeaponChange = (key: string) => {
    const weapon = weapons.find((w) => w.key === key || w.id === key)
    if (weapon) {
      setWeapon(key, weaponLevel, weaponRefinement)
    }
  }

  const getBaseStats = () => {
    if (!selectedWeapon || !selectedWeapon.base_stats) return null
    const statsForLevel = selectedWeapon.base_stats.find(
      (stat) => parseInt(stat.level) === weaponLevel
    )
    return (
      statsForLevel ||
      selectedWeapon.base_stats[selectedWeapon.base_stats.length - 1]
    )
  }

  const baseStats = getBaseStats()

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Weapon</h3>

      <CalculatorInput
        label="Weapon"
        type="select"
        value={weaponKey}
        onChange={handleWeaponChange}
        options={[
          { value: "", label: "Select Weapon" },
          ...weapons.map((weapon) => ({
            value: weapon.key || weapon.id,
            label: weapon.name,
          })),
        ]}
      />

      <CalculatorInput
        label="Level"
        type="number"
        value={weaponLevel}
        onChange={(val) =>
          setWeapon(weaponKey, val as number, weaponRefinement)
        }
        min={1}
        max={90}
      />

      <CalculatorInput
        label="Refinement"
        type="select"
        value={weaponRefinement}
        onChange={(val) => setWeapon(weaponKey, weaponLevel, val as number)}
        options={Array.from({ length: 5 }, (_, i) => ({
          value: i + 1,
          label: `R${i + 1}`,
        }))}
      />

      {baseStats && (
        <div className={styles.statsDisplay}>
          <div className={styles.statRow}>
            <span>Base ATK:</span>
            <span>{baseStats.base_atk}</span>
          </div>
          {baseStats.sub_stat_type && (
            <div className={styles.statRow}>
              <span>Secondary Stat:</span>
              <span>{baseStats.sub_stat_type}</span>
            </div>
          )}
          {baseStats.sub_stat_value && (
            <div className={styles.statRow}>
              <span>Secondary Stat Value:</span>
              <span>{baseStats.sub_stat_value}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

"use client"
import React, { useEffect, useMemo, useState } from "react"
import { useDamageCalculator } from "@/store/DamageCalculator"
import { Character } from "@/types/character"
import CalculatorInput from "./CalculatorInput"
import styles from "./calculator.module.css"

export default function CharacterSection() {
  const {
    characterKey,
    characterLevel,
    constellation,
    erRequirements,
    setCharacter,
    setERRequirements,
  } = useDamageCalculator()

  const [characters, setCharacters] = useState<Character[]>([])

  useEffect(() => {
    fetch("/api/characters")
      .then((res) => res.json())
      .then((data) => setCharacters(data.data || []))
      .catch((err) => console.error("Failed to fetch characters:", err))
  }, [])

  const selectedCharacter = useMemo(() => {
    if (!characterKey) return null
    return (
      characters.find((c) => c.key === characterKey || c.id === characterKey) ||
      null
    )
  }, [characterKey, characters])

  const handleCharacterChange = (key: string) => {
    const char = characters.find((c) => c.key === key || c.id === key)
    if (char) {
      setCharacter(key, characterLevel, constellation)
    }
  }

  const getBaseStats = () => {
    if (!selectedCharacter || !selectedCharacter.base_stats) return null
    const statsForLevel = selectedCharacter.base_stats.find(
      (stat) => parseInt(stat.LVL) === characterLevel
    )
    return (
      statsForLevel ||
      selectedCharacter.base_stats[selectedCharacter.base_stats.length - 1]
    )
  }

  const baseStats = getBaseStats()
  const ascensionStatType = selectedCharacter?.ascension_stat || ""

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Character</h3>

      <CalculatorInput
        label="Character"
        type="select"
        value={characterKey}
        onChange={handleCharacterChange}
        options={[
          { value: "", label: "Select Character" },
          ...characters.map((char) => ({
            value: char.key || char.id,
            label: char.name,
          })),
        ]}
      />

      <CalculatorInput
        label="Constellation"
        type="select"
        value={constellation}
        onChange={(val) =>
          setCharacter(characterKey, characterLevel, val as number)
        }
        options={Array.from({ length: 7 }, (_, i) => ({
          value: i,
          label: `c${i}`,
        }))}
      />

      <CalculatorInput
        label="Level"
        type="number"
        value={characterLevel}
        onChange={(val) =>
          setCharacter(characterKey, val as number, constellation)
        }
        min={1}
        max={90}
      />

      {baseStats && (
        <div className={styles.statsDisplay}>
          <div className={styles.statRow}>
            <span>Base ATK:</span>
            <span>{baseStats.BaseATK}</span>
          </div>
          <div className={styles.statRow}>
            <span>Ascension Stat Type:</span>
            <span>{ascensionStatType}</span>
          </div>
          {baseStats.AscensionStatValue && (
            <div className={styles.statRow}>
              <span>Ascension Stat Value:</span>
              <span>{baseStats.AscensionStatValue}</span>
            </div>
          )}
        </div>
      )}

      <CalculatorInput
        label="ER Requirements (%)"
        type="number"
        value={erRequirements}
        onChange={(val) => setERRequirements(val as number)}
        min={0}
        max={300}
      />
    </div>
  )
}

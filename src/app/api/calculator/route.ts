import { NextRequest, NextResponse } from "next/server"
import { getCharacter, getWeapon } from "@/utils/genshinData"

// Cache for aminus module
let aminusCache: any = null
let aminusLoadAttempted = false

async function loadAminus() {
  if (aminusLoadAttempted) {
    return aminusCache
  }
  aminusLoadAttempted = true

  try {
    // @ts-ignore - aminus is a beta package without type declarations
    aminusCache = await import(/* webpackIgnore: true */ "aminus")
    return aminusCache
  } catch (e) {
    console.warn("Aminus package not available:", e)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      characterKey,
      characterLevel,
      constellation,
      weaponKey,
      weaponLevel,
      weaponRefinement,
      artifacts,
      enemy,
      kqmcConstraints,
      buffs,
      rotation,
    } = body

    if (!characterKey || !weaponKey) {
      return NextResponse.json(
        { error: "Character and weapon are required" },
        { status: 400 }
      )
    }

    // Try to load aminus
    const aminus = await loadAminus()

    // If aminus is available, use it
    if (aminus && aminus.StatFactory && aminus.StatTable) {
      try {
        // Get character base stats
        const characterBaseStats =
          aminus.StatFactory.get_character_base_stats(characterKey)
        if (!characterBaseStats) {
          return NextResponse.json(
            { error: `Character ${characterKey} not found` },
            { status: 404 }
          )
        }

        // Get weapon base stats
        const weaponBaseStats =
          aminus.StatFactory.get_weapon_base_stats(weaponKey)
        if (!weaponBaseStats) {
          return NextResponse.json(
            { error: `Weapon ${weaponKey} not found` },
            { status: 404 }
          )
        }

        // Build stat table from artifacts, buffs, and KQMC constraints
        const statEntries: Array<[string, number]> = []

        // Add artifact stats
        artifacts?.forEach((artifact: any) => {
          if (artifact.statType && artifact.value) {
            statEntries.push([artifact.statType, artifact.value])
          }
        })

        // Add buff stats (with uptime consideration)
        buffs?.forEach((buff: any) => {
          if (buff.statType && buff.uptime > 0 && buff.avgStat) {
            statEntries.push([buff.statType, buff.avgStat])
          }
        })

        // Add KQMC distributed stats
        kqmcConstraints?.forEach((constraint: any) => {
          if (constraint.statType && constraint.distributed > 0) {
            statEntries.push([constraint.statType, constraint.distributed])
          }
        })

        // Chain character, weapon, and additional stats
        let statTable = characterBaseStats.chain(weaponBaseStats)

        if (statEntries.length > 0) {
          const additionalStats = aminus.StatTable.of(statEntries)
          statTable = statTable.chain(additionalStats)
        }

        // Calculate total stats
        const unboxedStats = aminus.StatTable.unbox(statTable)

        // Extract total stats (adjust based on actual API)
        const totalStats = {
          baseHP: unboxedStats.get?.("BaseHP") || 0,
          hpPercent: unboxedStats.get?.("HPPercent") || 0,
          flatHP: unboxedStats.get?.("FlatHP") || 0,
          totalHP:
            (unboxedStats.get?.("BaseHP") || 0) *
              (1 + (unboxedStats.get?.("HPPercent") || 0) / 100) +
            (unboxedStats.get?.("FlatHP") || 0),

          baseATK: unboxedStats.get?.("BaseATK") || 0,
          atkPercent: unboxedStats.get?.("ATKPercent") || 0,
          flatATK: unboxedStats.get?.("FlatATK") || 0,
          totalATK:
            (unboxedStats.get?.("BaseATK") || 0) *
              (1 + (unboxedStats.get?.("ATKPercent") || 0) / 100) +
            (unboxedStats.get?.("FlatATK") || 0),

          baseDEF: unboxedStats.get?.("BaseDEF") || 0,
          defPercent: unboxedStats.get?.("DEFPercent") || 0,
          flatDEF: unboxedStats.get?.("FlatDEF") || 0,
          totalDEF:
            (unboxedStats.get?.("BaseDEF") || 0) *
              (1 + (unboxedStats.get?.("DEFPercent") || 0) / 100) +
            (unboxedStats.get?.("FlatDEF") || 0),

          em: unboxedStats.get?.("EM") || 0,
          critRate: unboxedStats.get?.("CritRate") || 0,
          critDamage: unboxedStats.get?.("CritDMG") || 0,
          critMultiplier:
            1 +
            ((unboxedStats.get?.("CritRate") || 0) / 100) *
              ((unboxedStats.get?.("CritDMG") || 0) / 100),
          energyRecharge: unboxedStats.get?.("EnergyRecharge") || 0,

          elementalDMGBonus: unboxedStats.get?.("ElementalDMGBonus") || 0,
          physicalDMGBonus: unboxedStats.get?.("PhysicalDMGBonus") || 0,
          normalATKDMGBonus: unboxedStats.get?.("NormalATKDMGBonus") || 0,
          chargeATKDMGBonus: unboxedStats.get?.("ChargeATKDMGBonus") || 0,
          plungeDMGBonus: unboxedStats.get?.("PlungeDMGBonus") || 0,
          skillDMGBonus: unboxedStats.get?.("SkillDMGBonus") || 0,
          burstDMGBonus: unboxedStats.get?.("BurstDMGBonus") || 0,
          healingBonus: unboxedStats.get?.("HealingBonus") || 0,
        }

        // Calculate DPR and DPS if rotation is provided
        let dpr = 0
        let dps = 0

        if (rotation && rotation.length > 0 && aminus.Rotation) {
          const rotationObj = aminus.Rotation.of(rotation)
          dpr = rotationObj.evaluate(unboxedStats)
          const rotationDuration = body.rotationDuration || 20
          dps = dpr / rotationDuration
        }

        return NextResponse.json({
          totalStats,
          dpr,
          dps,
        })
      } catch (aminusError: any) {
        console.error("Aminus calculation error:", aminusError)
        // Fall through to fallback calculation
      }
    }

    // Fallback: Calculate stats manually from character/weapon data
    // Try multiple key formats - characters have both 'id' (toKey(name)) and 'key' (character.id)
    let character = await getCharacter(characterKey)
    if (!character) {
      // Try with different casing
      const { toKey } = await import("@/utils/standardizers")
      character = await getCharacter(toKey(characterKey))
    }

    // Also try searching by key if id lookup fails
    if (!character) {
      const { getCharacters } = await import("@/utils/genshinData")
      const characters = await getCharacters()
      character =
        characters.find(
          (c) => c.key === characterKey || c.id === characterKey
        ) || null
    }

    let weapon = await getWeapon(weaponKey)
    if (!weapon) {
      const { toKey } = await import("@/utils/standardizers")
      weapon = await getWeapon(toKey(weaponKey))
    }

    // Also try searching by key if id lookup fails
    if (!weapon) {
      const { getWeapons } = await import("@/utils/genshinData")
      const weapons = await getWeapons()
      weapon =
        weapons.find((w) => w.key === weaponKey || w.id === weaponKey) || null
    }

    if (!character) {
      return NextResponse.json(
        { error: `Character ${characterKey} not found` },
        { status: 404 }
      )
    }

    if (!weapon) {
      return NextResponse.json(
        { error: `Weapon ${weaponKey} not found` },
        { status: 404 }
      )
    }

    // Get character base stats for the specified level
    const characterBaseStat =
      character.base_stats?.find(
        (stat) => parseInt(stat.LVL) === characterLevel
      ) || character.base_stats?.[character.base_stats.length - 1]

    if (!characterBaseStat) {
      return NextResponse.json(
        { error: "Character base stats not found" },
        { status: 404 }
      )
    }

    // Get weapon base stats for the specified level
    const weaponBaseStat =
      weapon.base_stats?.find((stat) => parseInt(stat.level) === weaponLevel) ||
      weapon.base_stats?.[weapon.base_stats.length - 1]

    if (!weaponBaseStat) {
      return NextResponse.json(
        { error: "Weapon base stats not found" },
        { status: 404 }
      )
    }

    // Parse base values
    const baseHP = parseFloat(characterBaseStat.BaseHP) || 0
    const baseATK = parseFloat(characterBaseStat.BaseATK) || 0
    const baseDEF = parseFloat(characterBaseStat.BaseDEF) || 0
    const weaponBaseATK = parseFloat(weaponBaseStat.base_atk) || 0

    // Parse ascension stat (remove % sign if present)
    const ascensionStatValueStr =
      characterBaseStat.AscensionStatValue?.replace("%", "") || "0"
    const ascensionStatValue = parseFloat(ascensionStatValueStr) || 0
    const ascensionStatType = characterBaseStat.AscensionStatType

    // Parse weapon secondary stat (remove % sign if present)
    const weaponSubStatValueStr = (
      weaponBaseStat.sub_stat_value || "0"
    ).replace("%", "")
    const weaponSubStatValue = parseFloat(weaponSubStatValueStr) || 0
    const weaponSubStatType = weaponBaseStat.sub_stat_type || ""

    // Initialize stat accumulators
    let hpPercent = 0
    let flatHP = 0
    let atkPercent = 0
    let flatATK = 0
    let defPercent = 0
    let flatDEF = 0
    let em = 0
    let critRate = 0
    let critDamage = 0
    let energyRecharge = 0
    let elementalDMGBonus = 0
    let physicalDMGBonus = 0
    let normalATKDMGBonus = 0
    let chargeATKDMGBonus = 0
    let plungeDMGBonus = 0
    let skillDMGBonus = 0
    let burstDMGBonus = 0
    let healingBonus = 0

    // Add ascension stat
    const ascensionStatTypeLower = ascensionStatType.toLowerCase()
    if (ascensionStatType === "HP%" || ascensionStatTypeLower.includes("hp%")) {
      hpPercent += ascensionStatValue
    } else if (
      ascensionStatType === "ATK%" ||
      ascensionStatTypeLower.includes("atk%")
    ) {
      atkPercent += ascensionStatValue
    } else if (
      ascensionStatType === "DEF%" ||
      ascensionStatTypeLower.includes("def%")
    ) {
      defPercent += ascensionStatValue
    } else if (
      ascensionStatType === "CRIT DMG" ||
      ascensionStatTypeLower.includes("crit dmg") ||
      ascensionStatTypeLower.includes("crit damage")
    ) {
      critDamage += ascensionStatValue
    } else if (
      ascensionStatType === "CRIT Rate" ||
      ascensionStatTypeLower.includes("crit rate")
    ) {
      critRate += ascensionStatValue
    } else if (
      ascensionStatType === "Energy Recharge" ||
      ascensionStatTypeLower.includes("energy recharge")
    ) {
      energyRecharge += ascensionStatValue
    } else if (
      ascensionStatType === "Elemental Mastery" ||
      ascensionStatTypeLower.includes("elemental mastery")
    ) {
      em += ascensionStatValue
    } else if (
      ascensionStatTypeLower.includes("dmg bonus") ||
      ascensionStatTypeLower.includes("damage bonus")
    ) {
      // Handle elemental/physical DMG bonuses (e.g., "Geo DMG Bonus", "Physical DMG Bonus")
      if (ascensionStatTypeLower.includes("physical")) {
        physicalDMGBonus += ascensionStatValue
      } else {
        // Elemental DMG bonus (Pyro, Hydro, Electro, Anemo, Geo, Cryo, Dendro)
        elementalDMGBonus += ascensionStatValue
      }
    }

    // Add weapon secondary stat
    const weaponSubStatTypeLower = weaponSubStatType.toLowerCase()
    if (
      weaponSubStatTypeLower.includes("atk") &&
      !weaponSubStatTypeLower.includes("dmg")
    ) {
      if (weaponSubStatTypeLower.includes("%")) {
        atkPercent += weaponSubStatValue
      } else {
        flatATK += weaponSubStatValue
      }
    } else if (
      weaponSubStatTypeLower.includes("hp") &&
      !weaponSubStatTypeLower.includes("dmg")
    ) {
      if (weaponSubStatTypeLower.includes("%")) {
        hpPercent += weaponSubStatValue
      } else {
        flatHP += weaponSubStatValue
      }
    } else if (
      weaponSubStatTypeLower.includes("def") &&
      !weaponSubStatTypeLower.includes("dmg")
    ) {
      if (weaponSubStatTypeLower.includes("%")) {
        defPercent += weaponSubStatValue
      } else {
        flatDEF += weaponSubStatValue
      }
    } else if (weaponSubStatTypeLower.includes("crit")) {
      if (
        weaponSubStatTypeLower.includes("dmg") ||
        weaponSubStatTypeLower.includes("damage")
      ) {
        critDamage += weaponSubStatValue
      } else {
        critRate += weaponSubStatValue
      }
    } else if (
      weaponSubStatTypeLower.includes("energy") ||
      weaponSubStatTypeLower.includes("er")
    ) {
      energyRecharge += weaponSubStatValue
    } else if (
      weaponSubStatTypeLower.includes("mastery") ||
      weaponSubStatTypeLower.includes("em")
    ) {
      em += weaponSubStatValue
    } else if (
      weaponSubStatTypeLower.includes("dmg bonus") ||
      weaponSubStatTypeLower.includes("damage bonus")
    ) {
      // Handle DMG bonuses (Physical DMG Bonus, Elemental DMG Bonus)
      if (weaponSubStatTypeLower.includes("physical")) {
        physicalDMGBonus += weaponSubStatValue
      } else {
        // Elemental DMG bonus
        elementalDMGBonus += weaponSubStatValue
      }
    }

    // Add artifact stats
    // Default main stat values for level 20 artifacts (5-star)
    const artifactMainStatValues: Record<string, number> = {
      "Flat HP": 4780,
      "Flat ATK": 311,
      "HP%": 46.6,
      "ATK%": 46.6,
      "DEF%": 58.3,
      EM: 187,
      "ER%": 51.8,
      "CR%": 31.1,
      "CD%": 62.2,
      "Elemental DMG%": 46.6,
      "Physical DMG%": 58.3,
      "Healing Bonus": 35.9,
    }

    artifacts?.forEach((artifact: any) => {
      if (!artifact.statType) return

      const statType = artifact.statType
      const value =
        artifact.value > 0
          ? artifact.value
          : artifactMainStatValues[statType] || 0

      if (statType === "HP%" || statType.includes("HP%")) hpPercent += value
      else if (statType === "Flat HP" || statType.includes("Flat HP"))
        flatHP += value
      else if (statType === "ATK%" || statType.includes("ATK%"))
        atkPercent += value
      else if (statType === "Flat ATK" || statType.includes("Flat ATK"))
        flatATK += value
      else if (statType === "DEF%" || statType.includes("DEF%"))
        defPercent += value
      else if (statType === "Flat DEF" || statType.includes("Flat DEF"))
        flatDEF += value
      else if (statType === "EM" || statType.includes("Elemental Mastery"))
        em += value
      else if (statType === "CR%" || statType.includes("Crit Rate"))
        critRate += value
      else if (statType === "CD%" || statType.includes("Crit DMG"))
        critDamage += value
      else if (statType === "ER%" || statType.includes("Energy Recharge"))
        energyRecharge += value
      else if (statType.includes("Elemental DMG%")) elementalDMGBonus += value
      else if (statType.includes("Physical DMG%")) physicalDMGBonus += value
      else if (statType.includes("Healing Bonus")) healingBonus += value
    })

    // Add KQMC distributed stats
    kqmcConstraints?.forEach((constraint: any) => {
      if (!constraint.statType || constraint.distributed <= 0) return

      const statType = constraint.statType
      const value = constraint.distributed

      if (statType === "HP%") hpPercent += value
      else if (statType === "Flat HP") flatHP += value
      else if (statType === "ATK%") atkPercent += value
      else if (statType === "Flat ATK") flatATK += value
      else if (statType === "DEF%") defPercent += value
      else if (statType === "Flat DEF") flatDEF += value
      else if (statType === "EM") em += value
      else if (statType === "CR") critRate += value
      else if (statType === "CD") critDamage += value
      else if (statType === "ER") energyRecharge += value
    })

    // Add buff stats (with uptime consideration)
    buffs?.forEach((buff: any) => {
      if (!buff.statType || buff.uptime <= 0) return

      const avgValue = (buff.avgStat || 0) * (buff.uptime / 100)
      const statType = buff.statType

      if (statType.includes("HP%")) hpPercent += avgValue
      else if (statType.includes("Flat HP")) flatHP += avgValue
      else if (statType.includes("ATK%")) atkPercent += avgValue
      else if (statType.includes("Flat ATK")) flatATK += avgValue
      else if (statType.includes("DEF%")) defPercent += avgValue
      else if (statType.includes("Flat DEF")) flatDEF += avgValue
      else if (statType.includes("EM")) em += avgValue
      else if (statType.includes("CR%")) critRate += avgValue
      else if (statType.includes("CD%")) critDamage += avgValue
      else if (statType.includes("ER%")) energyRecharge += avgValue
      else if (statType.includes("Elemental DMG%"))
        elementalDMGBonus += avgValue
      else if (statType.includes("Physical DMG%")) physicalDMGBonus += avgValue
      else if (statType.includes("Normal ATK DMG%"))
        normalATKDMGBonus += avgValue
      else if (statType.includes("Charge ATK DMG%"))
        chargeATKDMGBonus += avgValue
      else if (statType.includes("Plunge DMG%")) plungeDMGBonus += avgValue
      else if (statType.includes("Skill DMG%")) skillDMGBonus += avgValue
      else if (statType.includes("Burst DMG%")) burstDMGBonus += avgValue
      else if (statType.includes("Healing Bonus")) healingBonus += avgValue
    })

    // Calculate totals
    const totalATK =
      (baseATK + weaponBaseATK) * (1 + atkPercent / 100) + flatATK
    const totalHP = baseHP * (1 + hpPercent / 100) + flatHP
    const totalDEF = baseDEF * (1 + defPercent / 100) + flatDEF
    const critMultiplier = 1 + (critRate / 100) * (critDamage / 100)

    // Calculate DPR and DPS from rotation
    let dpr = 0
    let dps = 0
    const actionDamages: Array<{ id: string; damage: number }> = []

    if (rotation && rotation.length > 0) {
      rotation.forEach((action: any) => {
        const multiplier = parseFloat(action.multiplier) || 0
        const mvPercent = parseFloat(action.mvPercent) || 0
        const instances = parseFloat(action.instances) || 0

        let actionDamage = 0

        if (multiplier > 0 && instances > 0) {
          // Damage formula: ATK * Multiplier * MV% * (1 + DMG Bonus) * DEF Multiplier * RES Multiplier
          // Simplified version for now
          let dmgBonus = 1

          // Apply appropriate DMG bonus based on action type
          const actionType = (action.actionType || "").toLowerCase()
          if (actionType.includes("normal") || actionType.includes("na")) {
            dmgBonus += normalATKDMGBonus / 100
          } else if (
            actionType.includes("charge") ||
            actionType.includes("ca")
          ) {
            dmgBonus += chargeATKDMGBonus / 100
          } else if (
            actionType.includes("plunge") ||
            actionType.includes("p")
          ) {
            dmgBonus += plungeDMGBonus / 100
          } else if (actionType === "e" || actionType.includes("skill")) {
            dmgBonus += skillDMGBonus / 100
          } else if (actionType === "q" || actionType.includes("burst")) {
            dmgBonus += burstDMGBonus / 100
          }

          // Apply elemental/physical DMG bonus for infused attacks
          if (actionType.includes("infused")) {
            if (actionType.includes("physical")) {
              dmgBonus += physicalDMGBonus / 100
            } else {
              dmgBonus += elementalDMGBonus / 100
            }
          } else if (actionType === "e" || actionType === "q") {
            // Skills and bursts are typically elemental
            dmgBonus += elementalDMGBonus / 100
          }

          // Calculate base damage
          const baseDamage = totalATK * multiplier * (mvPercent / 100)
          const damageWithBonus = baseDamage * dmgBonus

          // Apply DEF and RES multipliers (simplified)
          const defMultiplier = enemy?.defMultiplier || 0.5
          const resMultiplier = actionType.includes("physical")
            ? enemy?.physicalResMultiplier || 0.9
            : enemy?.elementalResMultiplier || 0.9

          const finalDamage = damageWithBonus * defMultiplier * resMultiplier
          actionDamage = finalDamage * instances
          dpr += actionDamage
        }

        // Store damage for this action
        if (action.id) {
          actionDamages.push({ id: action.id, damage: actionDamage })
        }
      })

      const rotationDuration = parseFloat(body.rotationDuration) || 20
      dps = rotationDuration > 0 ? dpr / rotationDuration : 0
    }

    return NextResponse.json({
      totalStats: {
        baseHP,
        hpPercent,
        flatHP,
        totalHP,
        baseATK: baseATK + weaponBaseATK,
        atkPercent,
        flatATK,
        totalATK,
        baseDEF,
        defPercent,
        flatDEF,
        totalDEF,
        em,
        critRate,
        critDamage,
        critMultiplier,
        energyRecharge,
        elementalDMGBonus,
        physicalDMGBonus,
        normalATKDMGBonus,
        chargeATKDMGBonus,
        plungeDMGBonus,
        skillDMGBonus,
        burstDMGBonus,
        healingBonus,
      },
      dpr,
      dps,
      actionDamages, // Return individual action damages
    })
  } catch (error: any) {
    console.error("Calculator API error:", error)
    return NextResponse.json(
      { error: error.message || "Calculation failed" },
      { status: 500 }
    )
  }
}

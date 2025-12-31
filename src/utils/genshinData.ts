"use server"

import { Weapon } from "@/types/weapon"
import { Artifact } from "@/types/artifact"
import { toKey } from "@/utils/standardizers"
import { Page } from "@/types/page"
import { CaseLower } from "lucide-react"
import { cookies } from "next/headers"
import path from "path"
import { Character, instanceOfCharacter } from "@/types/character"
import { gdGetCharacters, gdGetWeapons, gdGetArtifacts } from "./APIAdaptor"
import { unstable_cache } from "next/cache"

//let CDN_URL = "https://cdn.irminsul.moe/"
let CDN_URL =
  "https://raw.githubusercontent.com/lambdv/genshin-scraper/refs/heads/main/genshindata/public/"

// Use genshin-data as default for characters
export const getCharacters = unstable_cache(
  async (): Promise<any[]> => {
    return await gdGetCharacters()
  },
  ["characters-data-gd"],
  {
    revalidate: 3600,
    tags: ["characters"],
  }
)

// Separate function for custom API handling (not cached)
export async function getCharactersWithCustomAPI(): Promise<any[]> {
  const cookieStore = await cookies()
  const customAPI = cookieStore.get("customapi")?.value || null

  if (customAPI) {
    if (customAPI === "gd") return await gdGetCharacters()
    if (customAPI.includes("http")) {
      try {
        const response = await fetch(customAPI)
        const { data } = await response.json()

        // Validate the response data structure
        if (
          Array.isArray(data) &&
          data.length > 0 &&
          instanceOfCharacter(data[0])
        ) {
          return data
        }
      } catch (error) {
        console.error("Error fetching from custom API:", error)
      }
    }
  }

  return await getCharacters()
}

export const getWeapons = unstable_cache(
  async (): Promise<Weapon[]> => {
    return await gdGetWeapons()
  },
  ["weapons-data-gd"],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ["weapons"],
  }
)

export const getArtifacts = unstable_cache(
  async (): Promise<Artifact[]> => {
    return await gdGetArtifacts()
  },
  ["artifacts-data-gd"],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ["artifacts"],
  }
)

export async function getCharacter(id: string): Promise<Character | null> {
  return await getCharacters()
    .then(
      (characters) =>
        characters.find((character) => character.id === id) || null
    )
    .catch(() => null)
}

export async function getWeapon(id: string): Promise<Weapon | null> {
  return await getWeapons()
    .then((weapons) => weapons.find((weapon) => weapon.id === id) || null)
    .catch(() => null)
}

export async function getArtifact(id: string): Promise<Artifact | null> {
  return await getArtifacts()
    .then(
      (artifacts) => artifacts.find((artifact) => artifact.id === id) || null
    )
    .catch(() => null)
}

export async function getAllPages(): Promise<Page[]> {
  //"use cache"
  const [characters, weapons, artifacts] = await Promise.all([
    getCharacters(),
    getWeapons(),
    getArtifacts(),
  ])
  return [
    ...characters.map((item, index) => ({
      id: item.id,
      name: item.name,
      rarity: item.rarity,
      category: "Character",
    })),
    ...weapons.map((item, index) => ({
      id: item.id,
      name: item.name,
      rarity: item.rarity,
      category: "Weapon",
    })),
    ...artifacts.map((item, index) => ({
      id: item.id,
      name: item.name,
      rarity: item.rarity_max,
      category: "Artifact",
    })),
  ]
}

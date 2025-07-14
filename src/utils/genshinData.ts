"use server"

import { Weapon } from '@/types/weapon';
import { Artifact } from '@/types/artifact';
import { toKey } from '@/utils/standardizers'
import { Page } from '@/types/page'
import { CaseLower } from 'lucide-react';
import { cookies } from 'next/headers';
import path from 'path';
import { Character, instanceOfCharacter } from '@/types/character';
import { gdGetCharacters } from "./APIAdaptor"
import { unstable_cache } from 'next/cache';

//let CDN_URL = "https://cdn.irminsul.moe/"
let CDN_URL = "https://raw.githubusercontent.com/lambdv/genshin-scraper/refs/heads/main/genshindata/public/"

// Cache the characters data to avoid repeated API calls during build
export const getCharacters = unstable_cache(
  async (): Promise<any[]> => {
    return await fetch(CDN_URL + "data/characters.json")
        .then(res => res.json())
        .then(data => data.data)
        .then(data => data.map((character, index) => ({
            ...character,
            id: toKey(character.name),
            index: index
        }))) as Character[]
  },
  ['characters-data'],
  {
    revalidate: 3600, 
    tags: ['characters']
  }
)

// Separate function for custom API handling (not cached)
export async function getCharactersWithCustomAPI(): Promise<any[]> {
    const cookieStore = await cookies()
    const customAPI = cookieStore.get('customapi')?.value || null

    if (customAPI) {
        if (customAPI === "gd") 
            return await gdGetCharacters();
        if (customAPI.includes("http")) {
            try {
                const response = await fetch(customAPI);
                const { data } = await response.json();
                
                // Validate the response data structure
                if (Array.isArray(data) && data.length > 0 && instanceOfCharacter(data[0])) {
                    return data;
                }
            } catch (error) {console.error("Error fetching from custom API:", error);}
        }
    }

    return await getCharacters();
}

export const getWeapons = unstable_cache(
  async (): Promise<Weapon[]> => {
    return await fetch(CDN_URL + "data/weapons.json")
        .then(res => res.json())
        .then(data => data.data)
        .then(data => data.map((weapon, index) => ({
            ...weapon,
            id: toKey(weapon.name),
            index: index
        }))) as Weapon[]
  },
  ['weapons-data'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['weapons']
  }
)

export const getArtifacts = unstable_cache(
  async (): Promise<Artifact[]> => {
    return await fetch(CDN_URL + "data/artifacts.json")
        .then(res => res.json())
        .then(data => data.data)
        .then(data => data.map((artifact, index) => ({
            ...artifact,
            id: artifact.key,
            index: index,
            release_version: artifact.release_version.toString()
        }))) as Artifact[]
  },
  ['artifacts-data'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['artifacts']
  }
)

export async function getCharacter(id: string): Promise<Character | null>{
    return await getCharacters()
        .then(characters => characters.find(character => character.id === id) || null)
        .catch(() => null)
}

export async function getWeapon(id: string): Promise<Weapon | null>{
    return await getWeapons()
        .then(weapons => weapons.find(weapon => weapon.id === id) || null)
        .catch(() => null)
}

export async function getArtifact(id: string): Promise<Artifact | null>{
    return await getArtifacts()
        .then(artifacts => artifacts.find(artifact => artifact.id === id) || null)
        .catch(() => null)
}

export async function getAllPages(): Promise<Page[]>{
    //"use cache"
    const [characters, weapons, artifacts] = await Promise.all([
        getCharacters(),
        getWeapons(), 
        getArtifacts()
    ])
    return [
        ...characters.map((item, index) => ({
            id: item.id,
            name: item.name,
            rarity: item.rarity,
            category: "Character"
        })),
        ...weapons.map((item, index) => ({
            id: item.id,
            name: item.name, 
            rarity: item.rarity,
            category: "Weapon"
        })),
        ...artifacts.map((item, index) => ({
            id: item.id,
            name: item.name,
            rarity: item.rarity_max,
            category: "Artifact" 
        }))
    ]
} 
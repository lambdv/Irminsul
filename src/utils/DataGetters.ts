"use server"
import * as fs from 'fs';
import { Character } from '@/types/character';
import { Weapon } from '@/types/weapon';
import { Artifact } from '@/types/artifact';
import { toKey } from '@/utils/standardizers'

import artifactData from '@public/data/artifacts.json'
import characterData from '@public/data/characters.json'
import weaponData from '@public/data/weapons.json'

export async function getCharacters(): Promise<Character[]>{
    "use cache"
    const characters = characterData.data 
        .map((character, index) => ({
            ...character,
            id: toKey(character.name),
            index: index,
        })) as Character[]
    return characters
} 

export async function getWeapons(): Promise<Weapon[]>{
    "use cache"
    const weapons = weaponData.data 
        .map((weapon, index) => ({
            ...weapon,
            id: toKey(weapon.name),
            index: index,
        })) as Weapon[]
    return weapons
}

export async function getArtifacts(): Promise<Artifact[]>{
    "use cache"
    const artifacts = artifactData.data 
        .map((artifact, index) => ({
            ...artifact,
            id: artifact.key,
            index: index,
        })) as Artifact[]
    return artifacts
}

export async function getCharacter(id: string): Promise<Character | null>{
    "use cache"
    return await getCharacters()
        .then(characters => characters.find(character => character.id === id) || null)
        .catch(() => null)
}

export async function getWeapon(id: string): Promise<Weapon | null>{
    "use cache"
    return await getWeapons()
        .then(weapons => weapons.find(weapon => weapon.id === id) || null)
        .catch(() => null)
}

export async function getArtifact(id: string): Promise<Artifact | null>{
    "use cache"
    return await getArtifacts()
        .then(artifacts => artifacts.find(artifact => artifact.id === id) || null)
        .catch(() => null)
}

// async function loadJSON(path: string): Promise<any>{
//     "use cache"
//     return JSON.parse(fs.readFileSync(path, 'utf8'))
// }

// async function loadJSONs(directory: string): Promise<any[]>{
//     "use cache"
//     const files = await fs.readdirSync(directory)
//     const objects = await Promise.all(files.map(async (file) => await loadJSON(`${directory}/${file}`)))
//     return objects
// }

// async function getJSONs(category: 'characters' | 'weapons' | 'artifacts'): Promise<any[]>{
//     "use cache"
//     const objects = await loadJSONs('public/data/' + category)
//     const res: any[] = objects.map((obj, index) => ({
//         ...obj,
//         id: toKey(obj.name),
//         index: index
//     }))
//     return res
// }

export async function getAllPages(): Promise<Page[]>{
    "use cache"
    const [characters, weapons, artifacts] = await Promise.all([
        getCharacters(),
        getWeapons(), 
        getArtifacts()
    ])

    return [
        ...characters.map((item, index) => ({
            id: index,
            name: item.name,
            rarity: item.rarity,
            category: "Character"
        })),
        ...weapons.map((item, index) => ({
            id: characters.length + index,
            name: item.name, 
            rarity: item.rarity,
            category: "Weapon"
        })),
        ...artifacts.map((item, index) => ({
            id: characters.length + weapons.length + index,
            name: item.name,
            rarity: item.rarity_max,
            category: "Artifact" 
        }))
    ]
} 
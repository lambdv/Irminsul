"use server"
import * as fs from 'fs';
import { Character } from '@/types/character';
import { Weapon } from '@/types/weapon';
import { Artifact } from '@/types/artifact';
import { toKey } from '@/utils/standardizers'

export async function getCharacters(): Promise<Character[]>{
    return await getJSONs('characters') as Character[]
}

export async function getWeapons(): Promise<Weapon[]>{
    return await getJSONs('weapons') as Weapon[]    
}

export async function getArtifacts(): Promise<Artifact[]>{
    return await getJSONs('artifacts') as Artifact[]
}

export async function getArtifact(id: string): Promise<Artifact | null>{
    return await getJSONs('artifacts')
    .then(artifacts => artifacts.find(artifact => artifact.id === id) || null)
    .catch(() => null)
}

export async function getCharacter(id: string): Promise<Character | null>{
    return await getJSONs('characters')
    .then(characters => characters.find(character => character.id === id) || null)
    .catch(() => null)
}

export async function getWeapon(id: string): Promise<Weapon | null>{
    return await getJSONs('weapons')
    .then(weapons => weapons.find(weapon => weapon.id === id) || null)
    .catch(() => null)
}

async function loadJSON(path: string): Promise<any>{
    return JSON.parse(fs.readFileSync(path, 'utf8'))
}

async function loadJSONs(directory: string): Promise<any[]>{
    const files = await fs.readdirSync(directory)
    const objects = await Promise.all(files.map(async (file) => await loadJSON(`${directory}/${file}`)))
    return objects
}

async function getJSONs(category: 'characters' | 'weapons' | 'artifacts'): Promise<any[]>{
    "use cache"
    const objects = await loadJSONs('public/data/' + category)
    const res: any[] = objects.map((obj, index) => ({
        ...obj,
        id: toKey(obj.name),
        index: index
    }))
    return res
}

export async function getAllPages(): Promise<Page[]>{
    // "use cache"
    let pages: Page[] = []
    const jsonToResultItem = (json: any, category: string): Page[] => 
        json.map((item: any) => ({
            id: item.id, 
            name: item.name, 
            rarity: item.rarity, 
            category: category
        }))
    let characters = await getCharacters()
    let weapons = await getWeapons()
    let artifacts = await getArtifacts()
    let charactersPages = jsonToResultItem(characters, "Character")
    let weaponsPages = jsonToResultItem(weapons, "Weapon")
    let artifactsPages = jsonToResultItem(artifacts, "Artifact")
    pages = [...charactersPages, ...weaponsPages, ...artifactsPages]
    return pages
} 
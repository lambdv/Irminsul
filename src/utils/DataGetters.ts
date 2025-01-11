"use server"
import * as fs from 'fs';
import { Character } from '@/types/character';
import { Weapon } from '@/types/weapon';
import { Artifact } from '@/types/artifact';

async function loadData(directory: string) {
    const files = await fs.promises.readdir(directory);
    const dataPromises = files.map(async (file) => {
        const data = JSON.parse(await fs.promises.readFile(`${directory}/${file}`, 'utf8'));
        data.id = file.split('.')[0];
        return data;
    });
    return Promise.all(dataPromises);
}

let characterData: any[] = [];
let weaponData: any[] = [];
let artifactData: any[] = [];

  characterData = await loadData("data/characters/");
  weaponData = await loadData("data/weapons/"); 
  artifactData = await loadData("data/artifacts/");


export async function getCharacters(): Promise<Character[]> {
    return characterData;
}

export async function getWeapons(): Promise<Weapon[]> {
    return weaponData;
}

export async function getArtifacts(): Promise<Artifact[]> {
    return artifactData;
}

export async function getCharacter(id: string): Promise<Character | undefined> {
    return characterData.find(character => character.key === id);
}

export async function getWeapon(id: string): Promise<Weapon | undefined> {
    return weaponData.find(weapon => weapon.key === id);
}

export async function getArtifact(id: string): Promise<Artifact | undefined> {
    return artifactData.find(artifact => artifact.key === id);
}

/**
 * get all data from api and flatten it into a single array of type page
 */
export async function getAllPages(): Promise<Page[]> {
    let pages: Page[] = [];
    const jsonToResultItem = (json: any, category: string): Page[] => 
        json.map((item: any) => ({
            id: item.id, 
            name: item.name, 
            rarity: item.rarity, 
            category: category
        }));

    try {
        let characters = await getCharacters();
        let weapons = await getWeapons();
        let artifacts = await getArtifacts();
        
        const characterPages: Page[] = jsonToResultItem(characters, "Character");
        const weaponsPages: Page[] = jsonToResultItem(weapons, "Weapon");
        const artifactsPages: Page[] = jsonToResultItem(artifacts, "Artifact");
        
        pages = [...characterPages, ...weaponsPages, ...artifactsPages];
    } catch (error) {
        console.error("Error fetching pages:", error);
        return [];
    }

    return pages;
} 

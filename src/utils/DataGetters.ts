"use server"
import * as fs from 'fs';
import { Character } from '@/types/character';
import { Weapon } from '@/types/weapon';
import { Artifact } from '@/types/artifact';

// Function to read and parse JSON files from a given directory
const readDataFromDirectory = (directory: string, type: 'character' | 'weapon' | 'artifact') => {
    return fs.readdirSync(directory)
        .map(file => {
            const data = JSON.parse(fs.readFileSync(`${directory}/${file}`, 'utf8'));
            data.id = file.split('.')[0];
            if (type === 'weapon') {
                data.release_date_epoch = new Date(data.release_date).getTime() / 1000;
            }
            return data;
        });
};

// Load data at build time
const characterData = readDataFromDirectory("data/characters/", 'character');
const weaponData = readDataFromDirectory("data/weapons/", 'weapon');
const artifactData = readDataFromDirectory("data/artifacts/", 'artifact');

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

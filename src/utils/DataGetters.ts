"use server"
import * as fs from 'fs';
import { Character } from '@/types/character';
import { Weapon } from '@/types/weapon';
import { Artifact } from '@/types/artifact';

let characterData = fs.readdirSync("data/characters/")
                        .map(file => {
                            const character = JSON.parse(fs.readFileSync(`data/characters/${file}`, 'utf8'))
                            character.id = file.split('.')[0]
                            return character
                        })
let weaponData = fs.readdirSync("data/weapons/")
                        .map(file => {
                            const weapon = JSON.parse(fs.readFileSync(`data/weapons/${file}`, 'utf8'))
                            weapon.id = file.split('.')[0]
                            weapon.release_date_epoch = new Date(weapon.release_date).getTime() / 1000
                            return weapon
                        })
let artifactData = fs.readdirSync("data/artifacts/")
                        .map(file => {
                            const artifact = JSON.parse(fs.readFileSync(`data/artifacts/${file}`, 'utf8'))
                            artifact.id = file.split('.')[0]
                            return artifact
                        })


export async function getCharacters(): Promise<Character[]> {
    //"use cache"
    return characterData
}

export async function getWeapons(): Promise<Weapon[]> {
    //"use cache"
    return weaponData
}

export async function getArtifacts(): Promise<Artifact[]> {
    //"use cache"
    return artifactData
}

export async function getCharacter(id: string): Promise<Character> {
    //"use cache"
    const characters = await getCharacters()
    return characters.find(character => character.key === id)
}

export async function getWeapon(id: string){
    //"use cache"
    const weapons = await getWeapons()
    return weapons.find(weapon => weapon.key === id)
}

export async function getArtifact(id: string){
    //"use cache"
    const artifacts = await getArtifacts()
    return artifacts.find(artifact => artifact.key === id)
}


/**
 * get all data from api and flatten it into a single array of type page
 */
export async function getAllPages(): Promise<Page[]> {
    //"use cache"
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
        // Handle error appropriately, possibly returning an empty array or a fallback
        return [];
    }

    return pages;
} 


/**
 * helper method that fetches data from an api 
 */
// async function getFrom(url){
//     const res = await fetch(url, {
//         next: {
//             revalidate: 60 * 60 * 24 * 7 // weekly
//         }
//     })
//     const weapons = await res.json()
//     const weaponDataPromises = weapons.map(async (weapon) => {
//         const weaponData = await fetch(url+`/${weapon}`, {
//             next: {
//                 revalidate: 60 * 60 * 24 * 7 // weekly
//             }
//         })
//         return weaponData.json();
//     })
//     const weaponDataList = await Promise.all(weaponDataPromises);
//     return weaponDataList;
// }

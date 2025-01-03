"use server"

import * as fs from 'fs';

export type Character = {
    id: string
    name: string
    key: string
    title: string
    rarity: number
    element: string
    weapon: string
    release_date: string
    release_date_epoch: number
    // constellation: string
    // birthday: string
    // affiliation: string
    // region: string
    // special_dish: string
    // alternate_title?: string
    // description: string
    // base_stats: CharacterBaseStat[]
    // ascension_costs: CharacterAscensionCost[]
    // talents: CharacterTalent[]
    // passives: CharacterPassive[]
    // constellations: CharacterConstellation[]
    // ascension_stat: string
}

// type CharacterBaseStat = {
//     LVL: string
//     BaseHP: string
//     BaseATK: string
//     BaseDEF: string
//     AscensionStatType: string
//     AscensionStatValue: string
//     AscensionPhase: number
// }

// type CharacterConstellation = {
//     level: number
//     name: string
//     description: string
//     properties: any[]
// }

// type CharacterTalent = {
//     name: string
//     type: string
//     description: string
//     attributes: any[]
// }

// type CharacterPassive = {
//     name: string
//     type: string
//     description: string
// }

// type CharacterAscensionCost = {
//     AscensionPhase: number
//     materials: {
//         name: string
//         amount: string
//     }[]
// }

/**
 * fetches character data from the database api
 * @returns array of character json objects
 */
export async function getCharacters(): Promise<Character[]> {
    // "use cache"
    return fs.readdirSync('data/characters/')
        .map(file => {
            const character = JSON.parse(fs.readFileSync(`data/characters/${file}`, 'utf8'))
            character.id = file.split('.')[0]
            return character
        })
}

/**
 * fetches weapon data from the database api
 * @returns array of weapon json objects
 */
export async function getWeapons(){
    //"use cache"
    return fs.readdirSync('data/weapons/')
        .map(file => {
            const weapon = JSON.parse(fs.readFileSync(`data/weapons/${file}`, 'utf8'))
            weapon.id = file.split('.')[0]
            weapon.release_date_epoch = new Date(weapon.release_date).getTime() / 1000
            return weapon
        })
}

/**
 * fetches artifact data from the database api
 * @returns array of artifact json objects
 */
export async function getArtifacts(){
    //"use cache"
    return fs.readdirSync('data/artifacts/')
        .map(file => {
            const artifact = JSON.parse(fs.readFileSync(`data/artifacts/${file}`, 'utf8'))
            artifact.id = file.split('.')[0]
            return artifact
        })
}

export async function getArtifact(id: string){
    "use cache"
    const artifacts = await getArtifacts()
    return artifacts.find(artifact => artifact.key === id)
}

export async function getCharacter(id: string){
    "use cache"
    const characters = await getCharacters()
    return characters.find(character => character.key === id)
}

export async function getWeapon(id: string){
    "use cache"
    const weapons = await getWeapons()
    return weapons.find(weapon => weapon.key === id)
}

/**
 * get all data from api and flatten it into a single array of type page
 */
export async function getAllPages(): Promise<Page[]>{
    "use cache"
    let pages: Page[] = []

    const jsonToResultItem = (json: any, category: string) => 
        json.map((item: any) => ({
            id: item.id, 
            name: item.name, 
            rarity: item.rarity, 
            category: category
        }))
    const characters = jsonToResultItem(await getCharacters(), "Character")
    const weapons = jsonToResultItem(await getWeapons(), "Weapon")
    const artifacts = jsonToResultItem(await getArtifacts(), "Artifact")
    pages = [...characters, ...weapons, ...artifacts]

    return pages
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

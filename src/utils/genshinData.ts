"use server"
import { Character } from '@/types/character';
import { Weapon } from '@/types/weapon';
import { Artifact } from '@/types/artifact';
import { toKey } from '@/utils/standardizers'
import artifactData from '@public/data/artifacts.json'
import characterData from '@public/data/characters.json'
import weaponData from '@public/data/weapons.json'
import { Page } from '@/types/page'
import { CaseLower } from 'lucide-react';
import { cookies } from 'next/headers';

//homgdg adaptor
// async function fetchAvatarInfoConfig(): Promise<Character[] | null> {
//     try {
//         // Fetch the script as text
//         const response = await fetch("https://homdgcat.wiki/gi/EN/avatar.js");
//         //https://homdgcat.wiki/gi/EN/Avatar/Amber_1.js
//         //https://homdgcat.wiki/gi/EN/Avatar/Amber_2.js
//         const scriptText = await response.text();
        
//         // Use a function wrapper to safely execute the script and extract the variable
//         let extractedData;
//         const scriptWrapper = new Function("extractedData", scriptText + "\n extractedData.push(__AvatarInfoConfig);");
//         scriptWrapper((extractedData = []));
        
//         // Return the extracted array
//         let extractedArray = extractedData[0];

//         //modifiy array to fit with our character schema

//         extractedArray = extractedArray.map((obj, index) => {
//             let element = ""
//             switch(obj.Element.toLowerCase()){
//                 case "fire": element = "pyro" ; break;
//                 case "wind": element = "Anemo" ; break;
//                 case "water": element = "Hydro" ; break;
//                 case "elec": element = "Electro" ; break;
//                 case "ice": element = "Cryo" ; break;
//                 case "rock": element = "Geo"; break;
//                 case "grass": element = "Dendro"; break;
//             }

//             return {
//                 id: toKey(obj.Name),
//                 name: obj.Name,
//                 key: toKey(obj.Name),
//                 title: obj.Title,
//                 rarity: obj.Grade,
//                 element: element,
//                 vision: element,
//                 weapon: obj.Weapon,
//                 release_date: "",
//                 release_date_epoch: 0,
//                 constellation: "",
//                 birthday: obj.Birthday,
//                 affiliation: "",
//                 region: obj.Nation,
//                 special_dish: "",
//                 alternate_title: "",
//                 description: "",
//                 base_stats: [],
//                 ascension_costs: [],
//                 talents: [],
//                 passives: [],
//                 constellations: [],
//                 ascension_stat: obj.CustomPromote
//             }
//         }) as Character[]

//         return extractedArray;
//     } catch (error) {
//         console.error("Error fetching or extracting data:", error);
//         return null;
//     }
// }


// const adaptors = [
//     {
//         name: 'genshin.jmp.blue',
//         getCharacters: async () => {
//             const characterList = await fetch("https://genshin.jmp.blue/characters")
//                 .then(res => res.json())
//             let characters = []
//             for(const characterName of characterList){
//                 const characterData = await fetch(`https://genshin.jmp.blue/characters/${characterName}`)
//                 const characterDataJSON = await characterData.json()
                
//                 // Convert to our schema
//                 const adaptedCharacter: Character = {
//                     id: characterDataJSON.id,
//                     name: characterDataJSON.name,
//                     key: characterDataJSON.id,
//                     title: characterDataJSON.title,
//                     rarity: characterDataJSON.rarity,
//                     element: characterDataJSON.vision.toLowerCase(),
//                     weapon: characterDataJSON.weapon_type,
//                     release_date: characterDataJSON.release,
//                     release_date_epoch: new Date(characterDataJSON.release).getTime() / 1000,
//                     constellation: characterDataJSON.constellation,
//                     birthday: characterDataJSON.birthday.slice(5), // Remove year
//                     affiliation: characterDataJSON.affiliation,
//                     region: characterDataJSON.nation,
//                     special_dish: characterDataJSON.specialDish,
//                     alternate_title: "",
//                     description: characterDataJSON.description,
//                     base_stats: [], // Would need additional mapping
//                     ascension_costs: [], // Would need additional mapping
//                     talents: characterDataJSON.skillTalents.map(talent => ({
//                         name: talent.name,
//                         type: talent.type,
//                         description: talent.description,
//                         attributes: talent.upgrades.map(upgrade => ({
//                             hit: upgrade.name,
//                             values: [parseFloat(upgrade.value)]
//                         }))
//                     })),
//                     passives: characterDataJSON.passiveTalents.map(passive => ({
//                         name: passive.name,
//                         type: passive.unlock,
//                         description: passive.description
//                     })),
//                     constellations: characterDataJSON.constellations.map(constellation => ({
//                         level: constellation.level,
//                         name: constellation.name,
//                         description: constellation.description,
//                         properties: []
//                     })),
//                     ascension_stat: characterDataJSON.ascension_materials ? "ATK" : "" // Default to ATK if materials exist
//                 }
                
//                 characters.push(adaptedCharacter)
//             }
//             return characters
//         }
//     }
// ]

// async function fetchCustomAPI(customAPIObject){
//     const characters = await fetch(customAPIObject.characters)
//     const data = await characters.json()
//     return data
// }

export async function getCharacters(): Promise<any[]> {

    // const cookieStore = await cookies()
    // const customAPIObject = JSON.parse(cookieStore.get('customapi')?.value || '{}')

    // const adapt = adaptors.find(adaptor => customAPIObject.characters.includes(adaptor.name)) || null

    // if(adapt){
    //     const characters = await adapt.getCharacters()
    //     return characters
    // }


    // if(customAPIObject.characters){
    //     const data = await fetchCustomAPI(customAPIObject)
    //     return data.data as Character[]
    // }

    let characters = characterData.data.map((character, index) => ({
        ...character,
        id: toKey(character.name),
        index: index
    })) as Character[]

    return characters
    
}

export async function getWeapons(): Promise<Weapon[]>{
    const weapons = weaponData.data 
        .map((weapon, index) => ({
            ...weapon,
            id: toKey(weapon.name),
            index: index,
        })) as Weapon[]
    return weapons
}

export async function getArtifacts(): Promise<Artifact[]>{
    const artifacts = artifactData.data 
        .map((artifact, index) => ({
            ...artifact,
            id: artifact.key,
            index: index,
            release_version: artifact.release_version.toString()
        })) as Artifact[]
    return artifacts
}

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
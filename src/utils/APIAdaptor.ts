import { Weapon } from '@/types/weapon';
import { Artifact } from '@/types/artifact';
import { toKey } from '@/utils/standardizers'
import { Page } from '@/types/page'
import { CaseLower } from 'lucide-react';
import { cookies } from 'next/headers';
import path from 'path';
import GenshinData  from 'genshin-data';
import { Character as GDCharacter, 
    Ascension,
    Mat1,
    Stat,
    Constellation,
    Cv,
    Element,
    Skill,
    Attribute,
    TalentMaterial
 } from '@/types/gdtypes';
 import { Character,
    CharacterBaseStat,
    CharacterAscensionCost,
    CharacterTalent,
    CharacterTalentAttribute,
    CharacterPassive,
    CharacterConstellation
 } from '@/types/character';


 const gd = new GenshinData();

export function gdLibCharacterAdaptor(character: GDCharacter, characterIndex?: number): Character {
    let skillTypes: string[] = ["Elemental Burst", "Elemental Skill", "Normal Attack"]
    let passiveTypes: string[] = ["Night Realm's Gift Passive", "Utility Passive", "4th Ascension Passive", "1st Ascension Passive"]
    let ascensionPhase = 0
    return {
        id: toKey(character.name),
        index: characterIndex ? characterIndex : 0,
        name: character.name,
        key: character.id,
        title: character.title || '',
        rarity: character.rarity,
        element: character.element.id,
        vision: character.element.id,
        weapon: character.weapon_type.id,
        release_date: new Date(character.release).toISOString().split('T')[0],
        release_date_epoch: character.release,
        constellation: character.constellation,
        birthday: character.birthday.join('-'),
        affiliation: character.affiliation,
        region: character.region.id,
        special_dish: '',
        alternate_title: '',
        description: character.description,
        ascension_stat: '',
        base_stats: character.ascension.flatMap((a: Ascension, index: number): CharacterBaseStat[] => {
            return [
                {
                    LVL: a.level.toString(),
                    BaseHP: a.stats[1].values[0].toString(),
                    BaseATK: a.stats[2].values[0].toString(),
                    BaseDEF: a.stats[3].values[0].toString(),
                    AscensionStatType: character.substat,
                    AscensionStatValue: a.stats[4].values[0].toString(),
                    AscensionPhase: ascensionPhase
                },
                {
                    LVL: a.level.toString(),
                    BaseHP: a.stats[1].values[1].toString(),
                    BaseATK: a.stats[2].values[1].toString(),
                    BaseDEF: a.stats[3].values[1].toString(),
                    AscensionStatType: character.substat,
                    AscensionStatValue: a.stats[4].values[1].toString(),
                    AscensionPhase: ascensionPhase++
                }
            ]
        }).filter((_, i) => i !== 0 && i !== character.ascension.length-1),
        ascension_costs: [],
        talents: character.skills.map((s: Skill): CharacterTalent => ({
            name: s.name,
            type: skillTypes.pop(),
            description: s.description,
            attributes: s.attributes.map((a: Attribute): CharacterTalentAttribute => ({
                hit: a.label,
                values: a.values
            })),
            properties: []
        })),
        passives: character.passives.map((p: Constellation): CharacterPassive => ({
            name: p.name,
            type: passiveTypes.pop(),
            description: p.description,
            properties: []
        })),
        constellations: character.constellations.map((c: Constellation): CharacterConstellation => ({
            level: c.level,
            name: c.name,
            description: c.description,
            properties: []
        })),
    }
}

export function gdGetCharacters(): Promise<Character[]> {
    return gd.characters()
        .then(characters => characters
            .sort((a,b)=> b.release-a.release)
            .map((character, index) =>gdLibCharacterAdaptor(character, index))
        )
}



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
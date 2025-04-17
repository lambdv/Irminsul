"use server"
import { Character,
    CharacterBaseStat,
    CharacterAscensionCost,
    CharacterTalent,
    CharacterTalentAttribute,
    CharacterPassive,
    CharacterConstellation
 } from '@/types/character';
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
 } from 'genshin-data/dist/types/character';


let CDN_URL = "https://cdn.irminsul.moe/"


const gd = new GenshinData();


/**
 * convert
 * export interface Character {
    _id: number;
    id: string;
    name: string;
    title?: string;
    description: string;
    weapon_type: Element;
    element: Element;
    gender: Element;
    release: number;
    substat: string;
    affiliation: string;
    region: Element;
    rarity: number;
    birthday: Array<number | null>;
    constellation: string;
    domain: string;
    cv: Cv;
    skills: Skill[];
    passives: Constellation[];
    constellations: Constellation[];
    ascension: Ascension[];
    talent_materials: TalentMaterial[];
}
export interface Ascension {
    level: number[];
    stats: Stat[];
    cost?: number;
    mat1?: Mat1;
    mat3?: Mat1;
    mat4?: Mat1;
    mat2?: Mat1;
}
export interface Mat1 {
    _id: number;
    id: string;
    name: string;
    amount: number;
    rarity: number;
}
export interface Stat {
    label: string;
    values: Array<number | string>;
}
export interface Constellation {
    _id?: number;
    id: string;
    name: string;
    description: string;
    level: number;
}
export interface Cv {
    english: string;
    chinese: string;
    japanese: string;
    korean: string;
}
export interface Element {
    id: string;
    name?: string;
}
export interface Skill {
    _id: number;
    id: string;
    name: string;
    description: string;
    info: string;
    attributes: Attribute[];
}
export interface Attribute {
    label: string;
    values: string[];
}
export interface TalentMaterial {
    level: number;
    cost: number;
    items: Mat1[];
}
export declare class Convert {
    static toCharacter(json: string): Character[];
    static characterToJson(value: Character[]): string;
}


to export type Character = {
    id: string
    index?: number
    name: string
    key: string
    title: string
    rarity: number
    element: string
    vision: string
    weapon: string
    release_date: string
    release_date_epoch: number
    constellation: string
    birthday: string
    affiliation: string
    region: string
    special_dish: string
    alternate_title?: string
    description: string
    ascension_stat: string
    
    base_stats: CharacterBaseStat[]
    ascension_costs: CharacterAscensionCost[]
    talents: CharacterTalent[]
    passives: CharacterPassive[]
    constellations: CharacterConstellation[]
}

type CharacterBaseStat = {
    LVL: string
    BaseHP: string
    BaseATK: string
    BaseDEF: string
    AscensionStatType: string
    AscensionStatValue: string
    AscensionPhase: number
}

type CharacterConstellation = {
    level: number
    name: string
    description: string
    properties: any[]
}

type CharacterTalent = {
    name: string
    type: string
    description: string
    attributes?: CharacterTalentAttribute[]
    properties: any[]
}

type CharacterTalentAttribute = {
    hit: string
    values: (number | string)[]
}

type CharacterPassive = {
    name: string
    type: string
    description: string
    properties?: any[]
}

type CharacterAscensionCost = {
    AscensionPhase: number
    materials: CharacterAscensionMaterial[]
}
type CharacterAscensionMaterial = {
    name: string
    amount: string
}

 */

function gdLibCharacterAdaptor(character: GDCharacter, characterIndex?: number): Character {
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

export async function getCharacters(): Promise<any[]> {

    
    const cookieStore = await cookies()
    const customAPIObject = JSON.parse(cookieStore.get('gd')?.value || null)

    if(customAPIObject !== null){
        return await gd.characters()
        .then(characters => characters
            .sort((a,b)=> b.release-a.release)
            .map((character, index) =>gdLibCharacterAdaptor(character, index))
        )
    }

    // const adapt = adaptors.find(adaptor => customAPIObject.characters.includes(adaptor.name)) || null

    // if(adapt){
    //     const characters = await adapt.getCharacters()
    //     return characters
    // }


    // if(customAPIObject.characters){
    //     const data = await fetchCustomAPI(customAPIObject)
    //     return data.data as Character[]
    // }
    

        

    const characterData = await fetch(CDN_URL + "data/characters.json")
        .then(res => res.json())

    let characters = characterData.data.map((character, index) => ({
        ...character,
        id: toKey(character.name),
        index: index
    })) as Character[]

    return characters
}

export async function getWeapons(): Promise<Weapon[]>{
    const weaponData = await fetch(CDN_URL + "data/weapons.json")
        .then(res => res.json())

    let weapons = weaponData.data 
        .map((weapon, index) => ({
            ...weapon,
            id: toKey(weapon.name),
            index: index,
        })) as Weapon[]
    return weapons
}

export async function getArtifacts(): Promise<Artifact[]>{
    const artifactData = await fetch(CDN_URL + "data/artifacts.json")
        .then(res => res.json())

    let artifacts = artifactData.data 
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
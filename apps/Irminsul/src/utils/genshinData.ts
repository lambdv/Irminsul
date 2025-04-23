"use server"

import { Weapon } from '@/types/weapon';
import { Artifact } from '@/types/artifact';
import { toKey } from '@/utils/standardizers'
import { Page } from '@/types/page'
import { CaseLower } from 'lucide-react';
import { cookies } from 'next/headers';
import path from 'path';
import { Character } from '@/types/character';
import { gdGetCharacters } from "./APIAdaptor"

let CDN_URL = "https://cdn.irminsul.moe/"



export async function getCharacters(): Promise<any[]> {

    const cookieStore = await cookies()
    const gdCookie = cookieStore.get('gd')?.value || null

    if(gdCookie === null)
        return await gdGetCharacters()

    // const adapt = adaptors.find(adaptor => customAPIObject.characters.includes(adaptor.name)) || null

    // if(adapt){
    //     const characters = await adapt.getCharacters()
    //     return characters
    // }


    // if(customAPIObject.characters){
    //     const data = await fetchCustomAPI(customAPIObject)
    //     return data.data as Character[]
    // }
    
    return await fetch(CDN_URL + "data/characters.json")
        .then(res => res.json())
        .then(data => data.data)
        .then(data => data.map((character, index) => ({
            ...character,
            id: toKey(character.name),
            index: index
        }))) as Character[]
}

export async function getWeapons(): Promise<Weapon[]>{

    return await fetch(CDN_URL + "data/weapons.json")
        .then(res => res.json())
        .then(data => data.data)
        .then(data => data.map((weapon, index) => ({
            ...weapon,
            id: toKey(weapon.name),
            index: index
        }))) as Weapon[]
}

export async function getArtifacts(): Promise<Artifact[]>{
    return await fetch(CDN_URL + "data/artifacts.json")
        .then(res => res.json())
        .then(data => data.data)
        .then(data => data.map((artifact, index) => ({
            ...artifact,
            id: artifact.key,
            index: index,
            release_version: artifact.release_version.toString()
        }))) as Artifact[]
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
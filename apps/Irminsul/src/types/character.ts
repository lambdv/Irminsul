export type Character = {
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

export type CharacterBaseStat = {
    LVL: string
    BaseHP: string
    BaseATK: string
    BaseDEF: string
    AscensionStatType: string
    AscensionStatValue: string
    AscensionPhase: number
}

export type CharacterConstellation = {
    level: number
    name: string
    description: string
    properties: any[]
}

export type CharacterTalent = {
    name: string
    type: string
    description: string
    attributes?: CharacterTalentAttribute[]
    properties: any[]
}

export type CharacterTalentAttribute = {
    hit: string
    values: (number | string)[]
}

export type CharacterPassive = {
    name: string
    type: string
    description: string
    properties?: any[]
}

export type CharacterAscensionCost = {
    AscensionPhase: number
    materials: CharacterAscensionMaterial[]
}
export type CharacterAscensionMaterial = {
    name: string
    amount: string
}


export function instanceOfCharacter(obj: any): obj is Character {
    return obj && typeof obj === 'object' && 'id' in obj && 'name' in obj;
}
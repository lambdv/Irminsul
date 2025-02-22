export type Character = {
    id: string
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

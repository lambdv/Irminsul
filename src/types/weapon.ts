export type Weapon = {
    id: string
    name: string
    key: string
    rarity: number
    description: string
    category: string
    series: string
    release_date: string
    release_date_epoch: number
    base_atk_min: number
    base_atk_max: number
    sub_stat_type: string
    sub_stat_value_min: string
    sub_stat_value_max: string
    refinement_name: string
    refinements: string[]
    base_stats: WeaponBaseStat[]
}

export type WeaponBaseStat = {
    level: string
    base_atk: string
    sub_stat_type?: string
    sub_stat_value?: string
    ascension_phase?: number
}

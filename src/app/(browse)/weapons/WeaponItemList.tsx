"use client"
import explorePageCSS from '@/components/explore/explorePage.module.css'
import Item from '@/components/explore/Item'
import { SearchStore } from '@/store/Search'
import { WeaponFilterStore } from '@/store/WeaponFilters'
import { toKey } from '@/utils/standardizers'
import { useState, useEffect } from 'react'
import { flatten } from '@/utils/standardizers'
import { filterItemList, sortItems } from '@/utils/filterers'

export default function WeaponItemList(props:{data: any}) {
    const weapons = props.data
    const { SearchQuery } = SearchStore()
    const { selectedFilters, filters, descending } = WeaponFilterStore()
    const [sortBy, setSortBy] = useState("release_date")
    
    const [filteredWeapons, setFilteredWeapons] = useState<any[]>(weapons)
    useEffect(() => {
        const filters2d = [filters[0].rarities, filters[1].weapons, filters[2].stats.map((stat: any) => stat)]
        const itemTaggingFunction = (item: any) => [item.rarity+"-star", item.category, item.sub_stat_type]
        const filtered = filterItemList(weapons, filters2d, selectedFilters, SearchQuery, itemTaggingFunction)
        setFilteredWeapons(filtered)
    }, [weapons, filters, selectedFilters, SearchQuery]) 

    return (
        <div className={explorePageCSS.itemContainer}>
            {filteredWeapons
                .sort((a,b)=>sortItems(a, b, sortBy, descending))
                .map((weapon, index) => 
                    <Item
                        key={index} 
                        category="weapon"
                        name={weapon.name}
                        rarity={weapon.rarity}
                        src={`/assets/weapons/${toKey(weapon.name)}/${toKey(weapon.name)}_base_avatar.png`}
                        alt={toKey(weapon.name)}
                    />
                )
            }
        </div>
    )
}
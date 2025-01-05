"use client"
import explorePageCSS from '@/components/explore/explorePage.module.css'
import Item from '@/components/explore/Item'
import { SearchStore } from '@/store/Search'
import { WeaponFilterStore } from '@/store/WeaponFilters'
import { toKey } from '@/utils/standardizers'
import { useState, useEffect } from 'react'
import { flatten } from '@/utils/standardizers'
import { filterItemList } from '@/utils/filterers'


// function filterWeapons(weapons: any, filters: any, selectedFilters: string[], query: string): any[]{
//     if(selectedFilters.length === 0 && query.length === 0)
//         return weapons
//     const filters2d = [flatten(filters[0].rarities), flatten(filters[1].weapons), flatten(filters[2].stats)]

//     return weapons.filter((weapon) => { //for each character
//         const tags: string[] = [weapon.rarity+"-star", weapon.category, weapon.sub_stat_type] //tags for this character
//         const passed: boolean = filters2d.every((filter) => { //for each filter category
//             const subset = selectedFilters.filter((tag) => filter.includes(tag))
//             if(subset.length === 0) 
//                 return true //skip if selectedFilters doesn't have any tags for this category
//             return subset.some((tag) => tags.includes(tag)) //check if character has at least one tag from this category
//         })
//         const nameMatch: boolean = query==="" || weapon.name.toLowerCase().includes(query.toLowerCase())
//         return passed && nameMatch
//     })
// }

export default function WeaponItemList(props:{data: any}) {
    const weapons = props.data
    const { SearchQuery } = SearchStore()
    const { selectedFilters, filters, descending } = WeaponFilterStore()
    const [sortBy, setSortBy] = useState("release_date_epoch")
    const [filteredWeapons, setFilteredWeapons] = useState<any[]>([])

    const itemTaggingFunction = (item: any) => [item.rarity+"-star", item.category, item.sub_stat_type]
    const filters2d = [filters[0].rarities, filters[1].weapons, filters[2].stats.map((stat: any) => stat)]

    const sortingFn = (a: any, b: any) => { 
        switch(sortBy){
            case "release_date_epoch":
                const releaseDiff = (a.release_date_epoch - b.release_date_epoch)
                if(releaseDiff !== 0)
                    return releaseDiff
                const rarityDiff = a.rarity - b.rarity
                if(rarityDiff !== 0)
                    return rarityDiff
                return a.name.localeCompare(b.name)
            default:
                return a[sortBy].localeCompare(b[sortBy])           
        }
    }

    useEffect(() => {
        const filtered = filterItemList(weapons, filters2d, selectedFilters, SearchQuery, itemTaggingFunction)
        setFilteredWeapons(filtered)
    }, [filters, selectedFilters, SearchQuery]) 

    return (
        <div className={explorePageCSS.itemContainer}>
            {filteredWeapons.length === 0 && <p>No results for {SearchQuery}</p>}
            {filteredWeapons
                .sort(descending ? (a, b) => sortingFn(b, a) : sortingFn)
                .map((weapon, index) => (
                    <Item
                        key={index} 
                        category="weapon"
                        name={weapon.name}
                        rarity={weapon.rarity}
                        src={`/assets/weapons/${toKey(weapon.name)}/${toKey(weapon.name)}_base_avatar.png`}
                        alt={toKey(weapon.name)}
                    />
                ))}
        </div>
    )
}
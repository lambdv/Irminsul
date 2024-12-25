"use client"
import explorePageCSS from '@/components/explore/explorePage.module.css'
import Item from '@/components/explore/Item'
import { SearchStore } from '@/store/Search'
import { WeaponFilterStore } from '@/store/WeaponFilters'
import { useState } from 'react'


function filteredWeapons(weapons: any, filters: any, selectedFilters: string[], query: string){
    if(selectedFilters.length === 0 && query.length === 0)
        return weapons
    const filters2d = [filters[0].rarities, filters[1].weapons, filters[2].stats]

    return weapons.filter((weapon) => { //for each character
        const tags: string[] = [weapon.rarity+"-star", weapon.type, weapon.subStat] //tags for this character
        const passed: boolean = filters2d.every((filter) => { //for each filter category
            const subset = selectedFilters.filter((tag) => filter.includes(tag))
            if(subset.length === 0) return true //skip if selectedFilters doesn't have any tags for this category
            return subset.some((tag) => tags.includes(tag)) //check if character has at least one tag from this category
        })
        const nameMatch: boolean = query==="" || weapon.name.toLowerCase().includes(query.toLowerCase())
        return passed && nameMatch
    })
}

export default function WeaponItemList(props:{data: any}) {
    const weapons = props.data
    const { SearchQuery } = SearchStore()
    const { selectedFilters, filters, descending } = WeaponFilterStore()

    const [sortBy , setSortBy] = useState("name")
    

    return (
        <div className={explorePageCSS.itemContainer}>
            {filteredWeapons(weapons, filters, selectedFilters, SearchQuery)
                .sort((a, b) => a[sortBy].localeCompare(b[sortBy]) * (descending ? -1 : 1))
                .map((weapon, index) => (
                    <Item
                        key={index} 
                        category="weapon"
                        name={weapon.name}
                        rarity={weapon.rarity}
                        src={`/assets/weapons/${weapon.name.toLowerCase().replaceAll(" ", "-")}/profile.png`}
                    />
                ))}
        </div>
    )
}
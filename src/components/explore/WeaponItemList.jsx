"use client"
import explorePageCSS from '@/css/explorePage.module.css'
import useFetch from '@/hooks/useFetch.js'
import Item from '@/components/explore/Item.jsx'
import { SearchStore } from '@/store/Search'
import { WeaponFilterStore } from '@/store/WeaponFilters'


export default function WeaponItemList(props) {

    const weapons = props.weapons
    const { SearchQuery } = SearchStore()
    const { selectedCharacterFilters } = WeaponFilterStore()

    return (
        <div className={explorePageCSS.itemContainer}>
            {weapons.map((weapon, index) => (
                <Item
                    key={index} 
                    category="weapon"
                    name={weapon.name}
                    rarity={weapon.rarity}
                    src={`https://raw.githubusercontent.com/scafiy/Irminsul/master/src/assets/weapons/${weapon.name.toLowerCase().replaceAll(" ", "-")}/profile.png`}
                />
            ))}
        </div>
    )
}
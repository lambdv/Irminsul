"use client"
import explorePageCSS from '@/components/explore/explorePage.module.css'
import useFetch from '@/hooks/useFetch.js'
import Item from '@/components/explore/Item'
import { SearchStore } from '@/store/Search'
import { ArtifactFilterStore } from '@/store/ArtifactFilters'


export default function WeaponItemList(props) {
    const weapons: any[] = props.data
    const { SearchQuery } = SearchStore()
    const { selectedFilters } = ArtifactFilterStore()

    return (
        <div className={explorePageCSS.itemContainer}>
            {weapons.map((artifact, index) => (
            <Item
                key={index} 
                category="artifact"
                name={artifact.name}
                rarity={artifact.rarity}
                src={`/assets/artifacts/${artifact.name.toLowerCase().replaceAll(" ", "-")}/profile.png`}
            />
            ))}
        </div>
    )
}
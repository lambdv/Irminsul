"use client"
import explorePageCSS from '@/components/explore/explorePage.module.css'
import Item from '@/components/explore/Item'
import { SearchStore } from '@/store/Search'
import { CharacterFilterStore } from '@/store/CharacterFilters'
import { filterItemList } from '@/utils/filterers'
import { flatten, toKey } from '@/utils/standardizers'
import { useEffect, useState } from 'react'
import { Character } from '@/utils/DataGetters'

export default function CharacterItemList(props: {data: Character[]}) {
    const characters = props.data
    const { SearchQuery } = SearchStore()
    const { selectedFilters, filters, descending } = CharacterFilterStore()
    const itemTaggingFunction = (character: any) => [flatten(character.rarity+"-star"), flatten(character.vision), flatten(character.weapon)]
    const filters2d = [filters[0].rarities, filters[1].elements, filters[2].weapons]

    const [sortBy , setSortBy] = useState("release_date_epoch")

    const sortingFn = (a: Character, b: Character) => { 
        switch(sortBy){
            case "release_date_epoch":
                const releaseDiff = (a.release_date_epoch - b.release_date_epoch)
                if(releaseDiff !== 0)
                    return releaseDiff
                const rarityDiff = a.rarity - b.rarity
                if(rarityDiff !== 0)
                    return rarityDiff
                return a.name.localeCompare(b.name)           
        }
    }

    let filtered = filterItemList(characters, filters2d, selectedFilters, SearchQuery, itemTaggingFunction)

    useEffect(() => {
        filtered = filterItemList(characters, filters2d, selectedFilters, SearchQuery, itemTaggingFunction)
    }, [characters, filters, selectedFilters, SearchQuery])

    return (
        <div className={explorePageCSS.itemContainer}>
            {filtered.length === 0 && <div>No results for "{SearchQuery}"</div>}
            {filtered
                .sort(descending ? (a, b) => sortingFn(b, a) : sortingFn)
                .filter((character: any) => flatten(character.name) !== "traveler")
                .map((character, index) => (
                    <Item 
                        key={index} 
                        category="character"
                        name={character.name}
                        rarity={character.rarity}
                        element={character.element}
                        src={`/assets/characters/${toKey(character.name)}/${toKey(character.name)}_avatar.png`}
                        alt={toKey(character.name)}
                    />
                    )
                )}
        </div>
    )
}
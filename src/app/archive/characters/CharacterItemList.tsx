"use client"
import explorePageCSS from '@/components/explore/explorePage.module.css'
import Item from '@/components/explore/Item'
import { SearchStore } from '@/store/Search'
import { CharacterFilterStore } from '@/store/CharacterFilters'
import { filterItemList, sortItems } from '@/utils/filterers'
import { flatten, toKey } from '@/utils/standardizers'
import { useEffect, useState } from 'react'
import { Character } from '@/types/character'
import { getAssetURL } from '@/utils/getAssetURL'

export default function CharacterItemList(props: {data: Character[]}) {
    const characters = props.data
    const { SearchQuery } = SearchStore()
    const { selectedFilters, filters, descending } = CharacterFilterStore()
    const [sortBy, setSortBy] = useState("release_date_epoch")

    const [filteredCharacters, setFilteredCharacters] = useState<Character[]>(characters)
    useEffect(() => {
        const filters2d = [filters[0].rarities, filters[1].elements, filters[2].weapons, filters[3].ascensionstats]
        const itemTaggingFunction = (character: any) => [flatten(character.rarity+"-star"), flatten(character.vision), flatten(character.weapon), flatten(character.ascension_stat)]
        const filtered = filterItemList(characters, filters2d, selectedFilters, SearchQuery, itemTaggingFunction)
        setFilteredCharacters(filtered)
    }, [characters, filters, selectedFilters, SearchQuery])

    return (
        <div className={explorePageCSS.itemContainer}>
            {filteredCharacters
                .sort((a,b)=>sortItems(a, b, sortBy, descending))
                .filter((character: any) => flatten(character.name) !== "traveler")
                .map((character, index) => {
                    // console.log(getAssetURL("character", character.name, "avatar.png"))
                    return <Item 
                        key={index} 
                        category="character"
                        name={character.name}
                        rarity={character.rarity}
                        element={character.element}
                        src={getAssetURL("character", character.name, "avatar.png")}
                        alt={toKey(character.name)}
                    />
                }
                )}
                {filteredCharacters.length === 0 && <p>No characters found </p>}
        </div>
    )
}
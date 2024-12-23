"use client"
import explorePageCSS from '@/components/explore/explorePage.module.css'
import Item from '@/components/explore/Item'
import { SearchStore } from '@/store/Search'
import { CharacterFilterStore } from '@/store/CharacterFilters'
import { filterItemList } from '@/utils/filterers'
import { flatten } from '@/utils/standardizers'

export default function CharacterItemList(props: {data: any}) {
    const characters = props.data
    const { SearchQuery } = SearchStore()
    const { selectedFilters, filters } = CharacterFilterStore()
    const itemTaggingFunction = (character: any) => [flatten(character.rarity+"-star"), flatten(character.vision), flatten(character.weapon)]
    const filters2d = [filters[0].rarities, filters[1].elements, filters[2].weapons]
    return (
        <div className={explorePageCSS.itemContainer}>
            {filterItemList(characters, filters2d, selectedFilters, SearchQuery, itemTaggingFunction)
                .map((character, index) => (
                    <Item 
                        key={index} 
                        category="character"
                        name={character.name}
                        rarity={character.rarity}
                        element={character.vision}
                        src={`/assets/characters/${character.name.toLowerCase().replaceAll(" ", "-")}/profile.png`}
                    />
                )
            )}
        </div>
    )
}
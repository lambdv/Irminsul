"use client"
import explorePageCSS from '@/components/explore/explorePage.module.css'
import useFetch from '@/hooks/useFetch'
import Item from '@/components/explore/Item'
import { SearchStore } from '@/store/Search'
import { CharacterFilterStore } from '@/store/CharacterFilters'
// import { CharacterFilterStore } from '@/store/ExploreSearchFilters'


function filteredCharacters(characters: any, filters: any, selectedFilters: string[], query: string){
    if(selectedFilters.length === 0 && query.length === 0)
        return characters
    const filters2d = [filters[0].rarities, filters[1].elements, filters[2].weapons, filters[3].ascensionstats]
    return characters.filter((character) => { //for each character
        const tags: string[] = [character.rarity+"-star", character.vision, character.subStat] //tags for this character
        const passed: boolean = filters2d.every((filter) => { //for each filter category
            const subset = selectedFilters.filter((tag) => filter.includes(tag))
            if(subset.length === 0) return true //skip if selectedFilters doesn't have any tags for this category
            return subset.some((tag) => tags.includes(tag)) //check if character has at least one tag from this category
        })
        const nameMatch: boolean = query==="" || character.name.toLowerCase().includes(query.toLowerCase())
        return passed && nameMatch
    });
}

export default function CharacterItemList(props: {data: any}) {
    const characters = props.data
    const { SearchQuery } = SearchStore()
    const { selectedFilters: selectedFilters, filters } = CharacterFilterStore()
    return (
        <div className={explorePageCSS.itemContainer}>
            {filteredCharacters(characters, filters, selectedFilters, SearchQuery).map((character, index) => (
                <Item 
                    key={index} 
                    category="character"
                    name={character.name}
                    rarity={character.rarity}
                    element={character.vision}
                    src={`/assets/characters/${character.name.toLowerCase().replaceAll(" ", "-")}/profile.png`}
                />
            ))}
        </div>
    )
}
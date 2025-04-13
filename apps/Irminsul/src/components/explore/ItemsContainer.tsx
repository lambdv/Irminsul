"use client"
import explorePageCSS from '@/components/explore/explorePage.module.css'
import Item from '@/components/explore/Item'
import { SearchStore } from '@/store/Search'
import { CharacterFilterStore } from '@/store/CharacterFilters'
// import { CharacterFilterStore } from '@/store/ExploreSearchFilters'
import { flatten } from '@/utils/standardizers'

function filterMethod(characters: any, filters: string[][], selectedFilters: string[], query: string, itemTaggingFunction: (item: any)=> string[]){
    if(selectedFilters.length === 0 && query.length === 0)
        return characters
    return characters.filter((character) => { //for each character
        //const tags: string[] = [flatten(character.rarity+"-star"), flatten(character.vision), flatten(character.subStat), flatten(character.weapon)] //tags for this character
        const tags = itemTaggingFunction(character)
        const passed: boolean = filters.every((filter) => {
            let subset = selectedFilters.filter((tag) => filter.includes(tag))
            subset = subset.map((tag)=>flatten(tag))
            if(subset.length === 0) return true //skip if selectedFilters doesn't have any tags for this category
            return subset.some((tag) => tags.includes(tag)) //check if character has at least one tag from this category
        })
        const nameMatch: boolean = query==="" || character.name.toLowerCase().includes(query.toLowerCase())
        return passed && nameMatch
    })
}

export default function ItemsContainer(props: {data: any, store: any, type: string}) {
    const characters = props.data
    const { SearchQuery } = SearchStore()
    const { selectedFilters: selectedFilters, filters } = props.store()

    let itemTaggingFunction: (item: any)=> string[]
    let filters2d: string[][]

    switch(props.type){
        case "character":
            itemTaggingFunction = (character: any) => [flatten(character.rarity+"-star"), flatten(character.vision), flatten(character.weapon)]
            filters2d = [filters[0].rarities, filters[1].elements, filters[2].weapons]
            break
        case "weapon":
            itemTaggingFunction = (weapon: any) => [flatten(weapon.rarity+"-star"), flatten(weapon.type)]
            filters2d = [filters[0].rarities, filters[1].types]
            break
        case "artifact":
            itemTaggingFunction = (artifact: any) => [flatten(artifact.max_rarity+"-star")]
            filters2d = [filters[0].rarities]
            break
        default:
            itemTaggingFunction = (item: any) => []
            filters2d = []
    }

    return (
        <div className={explorePageCSS.itemContainer}>
            {
                filterMethod(characters, filters2d, selectedFilters, SearchQuery, itemTaggingFunction).map((character, index) => (
                    <Item 
                        key={index} 
                        category={props.type}
                        name={String(character.name)}
                        rarity={character.rarity}
                        element={String(character.vision)}
                        src={`/assets/${props.type}s/${character.name.toLowerCase()}/profile.png`}
                    />
                ))
            }
        </div>
    )
}
"use client"
import explorePageCSS from '@/components/explore/explorePage.module.css'
import useFetch from '@/hooks/useFetch'
import Item from '@/components/explore/Item'
import { SearchStore } from '@/store/Search'
import { CharacterFilterStore } from '@/store/CharacterFilters'
// import { CharacterFilterStore } from '@/store/ExploreSearchFilters'


export default function CharacterItemList(props: {characters: any}) {

    const characters = props.characters
    const { SearchQuery } = SearchStore()
    const { selectedFilters: selectedFilters, filters } = CharacterFilterStore()

    const rarityFilters = filters[0].rarities
    const elementFilters = filters[1].elements
    const weaponFilters = filters[2].weapons
    const statFilters = filters[3].ascensionstats

    const filterItems = () => {
        if(selectedFilters.length === 0 && SearchQuery === "") 
            return characters //if search and filters empty then just return characters

        
        return characters.filter((character) => {

            //tags this character hasexplorePageCSS
            const characterTags = [ character.rarity + "-star", character.vision, character.weapon ]

            //partition the selected filters into categories 
            const selectedRarityFilters = rarityFilters.filter((tag) => selectedFilters.includes(tag))
            const selectedElementFilters = elementFilters.filter((tag) => selectedFilters.includes(tag))
            const selectedWeaponFilters = weaponFilters.filter((tag) => selectedFilters.includes(tag))
            const selectedStatFilters = statFilters.filter((tag) => selectedFilters.includes(tag))

            //character pass a check for each filter category if they have at least one tag from the partition or if the partition is empty
            let rarityCheck = selectedRarityFilters.length > 0 ? selectedRarityFilters.some((tag) => characterTags.includes(tag)) : true
            let elementCheck = selectedElementFilters.length > 0 ? selectedElementFilters.some((tag) => characterTags.includes(tag)) : true
            let weaponCheck = selectedWeaponFilters.length > 0 ? selectedWeaponFilters.some((tag) => characterTags.includes(tag)) : true
            let statCheck = selectedStatFilters.length > 0 ? selectedStatFilters.some((tag) => characterTags.includes(tag)) : true

            if (selectedFilters.length > 0 && SearchQuery !== "") { 
                return character.name.toLowerCase().includes(SearchQuery.toLowerCase()) && rarityCheck && elementCheck && weaponCheck
            }
            if (selectedFilters.length > 0){ 
                return rarityCheck && elementCheck && weaponCheck
            }
            if (SearchQuery !== ""){  
                return character.name.toLowerCase().includes(SearchQuery.toLowerCase()) 
            }
        })
    }

    return (
        <div className={explorePageCSS.itemContainer}>
            {filterItems().map((character, index) => (
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
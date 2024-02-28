"use client"
import explorePageCSS from '@/css/explorePage.module.css'
import useFetch from '@/hooks/useFetch.js'
import Item from '@/components/explore/Item.jsx'
import { SearchStore } from '@/store/Search'
import { CharacterFilterStore } from '@/store/CharacterFilters'


export default function CharacterItemList(props) {

    const characters = props.characters
    const { SearchQuery } = SearchStore()
    const { selectedCharacterFilters, possibleCharacterRarityFilters, possibleCharacterElementFilters, possibleCharacterWeaponFilters, possibleCharacterStatFilters } = CharacterFilterStore()

    const filterItems = () => {
        if(selectedCharacterFilters.length === 0 && SearchQuery === "") return characters //if search and filters empty then just return characters

        return characters.filter((character) => {

            //tags this character has
            const characterTags = [ character.rarity + "-star", character.vision, character.weapon ]

            //partition the selected filters into categories 
            const selectedRarityFilters = possibleCharacterRarityFilters.filter((tag) => selectedCharacterFilters.includes(tag))
            const selectedElementFilters = possibleCharacterElementFilters.filter((tag) => selectedCharacterFilters.includes(tag))
            const selectedWeaponFilters = possibleCharacterWeaponFilters.filter((tag) => selectedCharacterFilters.includes(tag))
            const selectedStatFilters = possibleCharacterStatFilters.filter((tag) => selectedCharacterFilters.includes(tag))

            //character pass a check for each filter category if they have at least one tag from the partition or if the partition is empty
            let rarityCheck = selectedRarityFilters.length > 0 ? selectedRarityFilters.some((tag) => characterTags.includes(tag)) : true
            let elementCheck = selectedElementFilters.length > 0 ? selectedElementFilters.some((tag) => characterTags.includes(tag)) : true
            let weaponCheck = selectedWeaponFilters.length > 0 ? selectedWeaponFilters.some((tag) => characterTags.includes(tag)) : true
            let statCheck = selectedStatFilters.length > 0 ? selectedStatFilters.some((tag) => characterTags.includes(tag)) : true

            if (selectedCharacterFilters.length > 0 && SearchQuery !== "") { 
                return character.name.toLowerCase().includes(SearchQuery.toLowerCase()) && rarityCheck && elementCheck && weaponCheck
            }
            if (selectedCharacterFilters.length > 0){ 
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
                    src={`https://raw.githubusercontent.com/scafiy/Irminsul/master/src/assets/characters/${character.name.toLowerCase().replaceAll(" ", "-")}/profile.png`}
                />
            ))}
        </div>
    )
}
"use client"
import explorePageCSS from '@/css/explorePage.module.css'
import useFetch from '@/hooks/useFetch.js'
import Item from '@/components/explore/Item.jsx'
import { SearchStore } from '@/store/Search'
import { CharacterFilterStore } from '@/store/CharacterFilters'


export default function CharacterItemList(props) {

    const characters = props.characters
    const { SearchQuery } = SearchStore()
    const { selectedCharacterFilters, posibleCharacterRarityFilters, posibleCharacterElementFilters, posibleCharacterWeaponFilters, posibleCharacterStatFilters } = CharacterFilterStore()

    const filterItems = () => {
        return characters.filter((character) => {

            const characterRarity = character.rarity + "-star"
            const characterElement = character.vision
            const characterWeapon = character.weapon
            // const characterStat = character.stat
            const characterTags = []
            characterTags.push(characterRarity, characterElement, characterWeapon)

            const selectedRarityFilters = posibleCharacterRarityFilters.filter((tag) => selectedCharacterFilters.includes(tag))
            const selectedElementFilters = posibleCharacterElementFilters.filter((tag) => selectedCharacterFilters.includes(tag))
            const selectedWeaponFilters = posibleCharacterWeaponFilters.filter((tag) => selectedCharacterFilters.includes(tag))
            // const selectedStatFilters = posibleCharacterStatFilters.filter((tag) => selectedCharacterFilters.includes(tag))

            if (selectedCharacterFilters.length > 0 && SearchQuery !== "") { 
                return character.name.toLowerCase().includes(SearchQuery.toLowerCase()) && selectedCharacterFilters.every((tag) => characterTags.includes(tag));
            }
            if (selectedCharacterFilters.length > 0){ 
                return selectedCharacterFilters.every((tag) => characterTags.includes(tag));
            }
            if (SearchQuery !== ""){  
                return character.name.toLowerCase().includes(SearchQuery.toLowerCase()) 
            }
            return characters;
        })
    }

    return (
        <div className={explorePageCSS.itemContainer}>

            {filterItems().map((character, index) => (
                <Item 
                    rarity={character.rarity}
                    key={index} 
                    name={character.name}
                    element={character.vision}
                    src={`https://raw.githubusercontent.com/scafiy/Irminsul/master/src/assets/characters/${character.name.toLowerCase().replace(" ", "")}/profile.png`}
                />
            ))}

        </div>
    )
}


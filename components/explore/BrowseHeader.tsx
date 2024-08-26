"use client"

import { useState } from 'react'
import Image from 'next/image'

import explorePageCSS from '@/styles/explorePage.module.css'
import modalCSS from '@/components/ui/modal.module.css'

import Modal from '@/components/ui/Modal'
import Btn from '@/components/ui/Btn'
import Tag from '@/components/ui/Tag'
import characterIcon from '@/public/assets/icons/characterIcon.png'

import { CharacterFilterStore } from '@/store/CharacterFilters'
import { WeaponFilterStore } from '@/store/WeaponFilters'
import { ArtifactFilterStore } from '@/store/ArtifactFilters'



export default function BrowseHeader(props) {

    const { selectedCharacterFilters, setSelectedCharacterFilters } = CharacterFilterStore()
    const { selectedWeaponFilters, setSelectedWeaponFilters } = WeaponFilterStore()
    const { selectedArtifactFilters, setSelectedArtifactFilters } = ArtifactFilterStore()

    const { possibleCharacterRarityFilters, possibleCharacterElementFilters, possibleCharacterWeaponFilters, possibleCharacterStatFilters } = CharacterFilterStore()
    const { possibleWeaponRarityFilters, possibleWeaponTypeFilters, possibleWeaponStatFilters } = WeaponFilterStore()
    const { possibleArtifactRarityFilters } = ArtifactFilterStore()

    let filters;
    let selectedFilters;
    let setSelectedFilters;

    switch (props.page) {
        case 'character':
            filters = [
                { Rarity: possibleCharacterRarityFilters },
                { Element: possibleCharacterElementFilters },
                { Weapon: possibleCharacterWeaponFilters },
                { Stat: possibleCharacterStatFilters }
            ]
            selectedFilters = selectedCharacterFilters
            setSelectedFilters = setSelectedCharacterFilters
            break;

        case 'weapon':
            filters = [
                { Rarity: possibleWeaponRarityFilters },
                { Type: possibleWeaponTypeFilters },
                { Stat: possibleWeaponStatFilters }
            ]
            selectedFilters = selectedWeaponFilters
            setSelectedFilters = setSelectedWeaponFilters
            break;

        case 'artifact':
            filters = [
                { Rarity: possibleArtifactRarityFilters }
            ]
            selectedFilters = selectedArtifactFilters
            setSelectedFilters = setSelectedArtifactFilters
            break;
    }
    

    const [ tempFilters, setTempFilters ] = useState([])
    
    const [showModal, setShowModal] = useState(false)

    const toggleModal = () => {
        setShowModal(!showModal)
        setTempFilters(selectedFilters) //clear changes
    }

    const toggleTag = (e) => {
        let tag = e.target.textContent //get tag label
        if(!tempFilters.includes(tag)) { setTempFilters([...tempFilters, tag]) } //add tag to tempFilters
        else{ setTempFilters( tempFilters.filter((filter) => filter !== tag) ) } //remove tag from tempFilters
    }

    const removeTag = (e) => {
        let tag = e.target.textContent //get tag label
        setSelectedFilters( selectedFilters.filter((filter) => filter !== tag) ) //remove tag from tempFilters
    }

    const applyFilters = () => {
        setSelectedFilters(tempFilters)
        setShowModal(false)
    }

    return (
        <>
            <div className={explorePageCSS.header}>
                <div className='flex'>
                    <Image src={characterIcon} alt=''/>
                    <h1 className={explorePageCSS.ingameTitle}>{props.title}</h1>
                </div>

                <div className={explorePageCSS.controller}>
                    <Btn onClick={toggleModal}> 
                        <i className="material-symbols-outlined">filter_list</i>
                        <p>Filters</p>
                    </Btn>
                </div>
            </div>

            <div className={explorePageCSS.activeTagsRail + ` flex`}>
                {selectedFilters.map((filter, index) => {
                    return <Tag key={index} selected={true} onClick={removeTag}>{filter}</Tag> 
                })}
            </div>

            {showModal &&  // if show is true, show the modal
                <Modal title="Filters" toggle={toggleModal} apply={applyFilters}>

                    {filters.map((filterCategory, index) => {
                        const filterTitle = Object.keys(filterCategory)[0];
                        const filterArray = filterCategory[Object.keys(filterCategory)[0]];
                        return (
                            <div className={explorePageCSS.tagCatagory} key={index}>
                                <label>{filterTitle}</label>

                                {filterArray.map((tag, index) => ( 
                                    <Tag 
                                        key={`${filterTitle}-${tag}-${index}`} 
                                        onClick={toggleTag} 
                                        selected={tempFilters.includes(tag)}>
                                            {tag}
                                    </Tag> 
                                ))}
                            </div>
                        )
                    })}

                    <div className={modalCSS.options}>
                        <Btn onClick={toggleModal}>Cancel</Btn>
                        <Btn onClick={applyFilters}>Apply</Btn>
                    </div>
                </Modal>
            }
        </>
    )
}

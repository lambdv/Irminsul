"use client"

import { useState } from 'react'
import Image from 'next/image'

import explorePageCSS from '@/css/explorePage.module.css'
import modalCSS from '@/css/modal.module.css'

import Modal from '@/components/ui/modal'
import Btn from '@/components/ui/Btn'
import Tag from '@/components/ui/Tag'
import characterIcon from '@/assets/icons/characterIcon.png'

import { CharacterFilterStore } from '@/store/CharacterFilters'

export default function Header(props) {

    const { possibleCharacterRarityFilters, possibleCharacterElementFilters, possibleCharacterWeaponFilters, possibleCharacterStatFilters } = CharacterFilterStore()

    const [ tempFilters, setTempFilters ] = useState([])
    const { selectedCharacterFilters, setSelectedCharacterFilters } = CharacterFilterStore()
    
    const [showModal, setShowModal] = useState(false)

    const toggleModal = () => {
        setShowModal(!showModal)
        setTempFilters(selectedCharacterFilters) //clear changes
    }

    const selectTag = (e) => {
        let tag = e.target.textContent //get tag label
        if(!tempFilters.includes(tag)) { setTempFilters([...tempFilters, tag]) } //add tag to tempFilters
        else{ setTempFilters( tempFilters.filter((filter) => filter !== tag) ) } //remove tag from tempFilters
    }

    const removeTag = (e) => {
        let tag = e.target.textContent //get tag label
        setSelectedCharacterFilters( selectedCharacterFilters.filter((filter) => filter !== tag) ) //remove tag from tempFilters
    }

    const applyFilters = () => {
        setSelectedCharacterFilters(tempFilters)
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
                {selectedCharacterFilters.map((filter, index) => {
                    return <Tag selected={true} onClick={removeTag}>{filter}</Tag> 
                })}
            </div>


            {showModal &&  // if show is true, show the modal
                <Modal title="Filters" toggle={toggleModal} apply={applyFilters}>

                    <div className={explorePageCSS.tagCatagory}>
                        <label>Rarity: </label>
                        {possibleCharacterRarityFilters.map((filter, index) => { return <Tag key={index} onClick={selectTag} selected={tempFilters.includes(filter)}>{filter}</Tag> })}
                    </div>
                    
                    <div className={explorePageCSS.tagCatagory}>
                        <label>Element: </label>
                        {possibleCharacterElementFilters.map((filter, index) => { return <Tag key={index} onClick={selectTag} selected={tempFilters.includes(filter)}>{filter}</Tag> })}

                    </div>

                    <div className={explorePageCSS.tagCatagory}>
                        <label>Weapon: </label>
                        {possibleCharacterWeaponFilters.map((filter, index) => { return <Tag key={index} onClick={selectTag} selected={tempFilters.includes(filter)}>{filter}</Tag> })}
                    </div>

                    <div className={explorePageCSS.tagCatagory}>
                        <label>Ascension Stat: </label>
                        {possibleCharacterStatFilters.map((filter, index) => { return <Tag key={index} onClick={selectTag} selected={tempFilters.includes(filter)}>{filter}</Tag> })}
                    </div>

                    <div className={modalCSS.options}>
                        <Btn onClick={toggleModal}>Cancel</Btn>
                        <Btn onClick={applyFilters}>Apply</Btn>
                    </div>
                </Modal>
            }
        </>
    )
}

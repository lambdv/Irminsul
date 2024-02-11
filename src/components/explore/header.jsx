"use client"

import { useState } from 'react'
import Image from 'next/image'

import explorePageCSS from '@/css/explorePage.module.css'
import modalCSS from '@/css/modal.module.css'

import Modal from '@/components/ui/modal'
import Btn from '@/components/ui/Btn'
import Tag from '@/components/ui/tag'
import characterIcon from '@/assets/icons/characterIcon.png'

import { CharacterFilterStore } from '@/store/CharacterFilters'

export default function Header(props) {

    const [show, setShow] = useState(false)

    const { posibleCharacterRarityFilters, posibleCharacterElementFilters, posibleCharacterWeaponFilters, posibleCharacterStatFilters } = CharacterFilterStore()

    let rarityFilterList = posibleCharacterRarityFilters
    let elementFilterList = posibleCharacterElementFilters
    let weaponFilterList = posibleCharacterWeaponFilters
    let ascensionFilterList = posibleCharacterStatFilters

    const [ tempFilters, setTempFilters ] = useState([])
    const { selectedCharacterFilters, setSelectedCharacterFilters } = CharacterFilterStore()

    const toggleModal = () => {
        setShow(!show)
        setTempFilters(selectedCharacterFilters) //clear changes
    }

    const selectTag = (e) => {
        let tag = e.target.textContent //get tag label
        if(!tempFilters.includes(tag)) { setTempFilters([...tempFilters, tag]) } //add tag to tempFilters
        else{ setTempFilters( tempFilters.filter((filter) => filter !== tag) ) } //remove tag from tempFilters
    }

    const applyFilters = () => {
        setSelectedCharacterFilters(tempFilters)
        setShow(false)
    }

    return (
        <>
            <div className={explorePageCSS.header}>
                <div className='flex'>
                    <Image src={characterIcon} alt=''/>
                    <h1 className={explorePageCSS.ingameTitle}>{props.title}</h1>
                </div>
                {selectedCharacterFilters}

                <div className={explorePageCSS.controller}>
                    <Btn onClick={toggleModal}> 
                        <i className="material-symbols-outlined">filter_list</i>
                        <p>Filters</p>
                    </Btn>
                </div>
            </div>


            {show &&  // if show is true, show the modal
                <Modal title="Filters" toggle={toggleModal} apply={applyFilters}>

                    <div className={explorePageCSS.tagCatagory}>
                        <label>Rarity: </label>
                        {rarityFilterList.map((filter, index) => { return <Tag key={index} onClick={selectTag} selected={tempFilters.includes(filter)}>{filter}</Tag> })}
                    </div>
                    
                    <div className={explorePageCSS.tagCatagory}>
                        <label>Element: </label>
                        {elementFilterList.map((filter, index) => { return <Tag key={index} onClick={selectTag} selected={tempFilters.includes(filter)}>{filter}</Tag> })}

                    </div>

                    <div className={explorePageCSS.tagCatagory}>
                        <label>Weapon: </label>
                        {weaponFilterList.map((filter, index) => { return <Tag key={index} onClick={selectTag} selected={tempFilters.includes(filter)}>{filter}</Tag> })}
                    </div>

                    <div className={explorePageCSS.tagCatagory}>
                        <label>Ascension Stat: </label>
                        {ascensionFilterList.map((filter, index) => { return <Tag key={index} onClick={selectTag} selected={tempFilters.includes(filter)}>{filter}</Tag> })}
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

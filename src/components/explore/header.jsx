"use client"
import explorePageCSS from '../../css/explorePage.module.css'
import modalCSS from '../../css/modal.module.css'

import { useState, useEffect } from 'react'
import Modal from '../ui/modal'
import Btn from '../ui/Btn'
import Tag from '../ui/tag'
import Image from 'next/image'
import characterIcon from '../../assets/icons/characterIcon.png'

export default function Header() {

    const [show, setShow] = useState(false)

    let rarityFilterList = ["5-star", "4-star"]
    let elementFilterList = ["Pyro", "Hydro", "Dendro", "Electro", "Anemo", "Cryo", "Geo"]
    let weaponFilterList = ["Sword", "Claymore", "Bow", "Polearm", "Catalyst"]
    let ascensionFilterList = ["ATK", "DEF", "HP", "Crit Rate", "Crit DMG", "Elemental Mastery", "Energy Recharge"]

    const [ tempFilters, setTempFilters ] = useState([])
    const [ selectedFilters, setSelectedFilters ] = useState([])

    useEffect(() => {
        const items = document.querySelectorAll('.item');
        items.forEach(item => {
            const itemId = item.id;
            
            const containsAllFilters = selectedFilters.every(filter => itemId.includes(filter));

            if (selectedFilters.length === 0 || containsAllFilters) {
                item.style.display = 'block'; // Display the item
            } else {
                item.style.display = 'none'; // Hide the item
            }
        });
    }, [selectedFilters]);
    

    const toggleModal = () => {
        setShow(!show)
        setTempFilters(selectedFilters) //clear changes
    }

    const selectTag = (e) => {
        let tag = e.target.textContent //get tag label
        if(!tempFilters.includes(tag)) { setTempFilters([...tempFilters, tag]) } //add tag to tempFilters
        else{ setTempFilters( tempFilters.filter((filter) => filter !== tag) ) } //remove tag from tempFilters
    }

    const applyFilters = () => {
        setSelectedFilters(tempFilters)
        setShow(false)
    }


    return (
        <>
            <div className={explorePageCSS.header}>
                <div className='flex'>
                    <Image src={characterIcon} alt=''/>
                    <h1 className={explorePageCSS.ingameTitle}>Character Archive</h1>
                </div>
                {selectedFilters}

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
                        {rarityFilterList.map((filter, index) => {
                            return <Tag key={index} onClick={selectTag} selected={tempFilters.includes(filter)}>{filter}</Tag>
                        })}
                    </div>
                    
                    <div className={explorePageCSS.tagCatagory}>
                        <label>Element: </label>
                        {elementFilterList.map((filter, index) => {
                            return <Tag key={index} onClick={selectTag} selected={tempFilters.includes(filter)}>{filter}</Tag>
                        })}

                    </div>

                    <div className={explorePageCSS.tagCatagory}>
                        <label>Weapon: </label>
                        {weaponFilterList.map((filter, index) => {
                            return <Tag key={index} onClick={selectTag} selected={tempFilters.includes(filter)}>{filter}</Tag>
                        })}
                    </div>

                    <div className={explorePageCSS.tagCatagory}>
                        <label>Ascension Stat: </label>
                        {ascensionFilterList.map((filter, index) => {
                            return <Tag key={index} onClick={selectTag} selected={tempFilters.includes(filter)}>{filter}</Tag>
                        })}
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

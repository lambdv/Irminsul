"use client"
import explorePageCSS from '../../css/explorePage.module.css'
import modalCSS from '../../css/modal.module.css'
import ChipCSS from '../../css/chip.module.css'

import { useState } from 'react'
import Modal from '../ui/modal'
import Button from '../ui/button'
import Chip from '../ui/chip'
import Image from 'next/image'
import characterIcon from '../../assets/icons/characterIcon.png'

export default function Header() {
    const [show, setShow] = useState(false)
    const [ tempFilters, setTempFilters ] = useState([])
    const [ filters, setFilters ] = useState([])

    const toggleModal = () => {
        setShow(!show)
        setTempFilters([])
    }

    const applyFilters = () => {
        setFilters(tempFilters)
        toggleModal()
    }

    const selectTag = (e) => {
        e.target.classList.toggle(ChipCSS.selected);
        if (!tempFilters.includes(e.target.textContent)) {
            setTempFilters([...tempFilters, e.target.textContent]);
        } else {
            setTempFilters(tempFilters.filter((tag) => tag !== e.target.textContent));
        }
    };


    return (
        <>
            <div className={explorePageCSS.header}>
                <div className='flex'>
                    <Image src={characterIcon} alt=''/>
                    <h1 className={explorePageCSS.ingameTitle}>Character Archive</h1>
                </div>
                {filters}

                <div className={explorePageCSS.controller}>
                    <Button onClick={toggleModal}> 
                        <i className="material-symbols-outlined">filter_list</i>
                        <p>Filters</p>
                    </Button>
                </div>
            </div>



            {show &&  // if show is true, show the modal
                <Modal title="Pick Your Poison" toggle={toggleModal} apply={applyFilters}>
                    {tempFilters}
                    <div className={explorePageCSS.tagCatagory}>
                        <label>Rarity: </label>
                        <Chip onClick={selectTag}>5 Star</Chip>
                        <Chip onClick={selectTag}>4 Star</Chip>
                    </div>
                    <div className={explorePageCSS.tagCatagory}>
                        <label>Element: </label>
                        <Chip onClick={selectTag}>Pyro</Chip>
                        <Chip onClick={selectTag}>Hydro</Chip>
                        <Chip onClick={selectTag}>Dendro</Chip>
                        <Chip onClick={selectTag}>Electro</Chip>
                        <Chip onClick={selectTag}>Anemo</Chip>
                        <Chip onClick={selectTag}>Cryo</Chip>
                        <Chip onClick={selectTag}>Geo</Chip>
                    </div>

                    <div className={explorePageCSS.tagCatagory}>
                        <label>Weapon: </label>
                        <Chip onClick={selectTag}>Sword</Chip>
                        <Chip onClick={selectTag}>Claymore</Chip>
                        <Chip onClick={selectTag}>Bow</Chip>
                        <Chip onClick={selectTag}>Polearm</Chip>
                        <Chip onClick={selectTag}>Catalyst</Chip>
                    </div>

                    <div className={explorePageCSS.tagCatagory}>
                        <label>Ascension Stat: </label>
                        <Chip onClick={selectTag}>ATK</Chip>
                        <Chip onClick={selectTag}>DEF</Chip>
                        <Chip onClick={selectTag}>HP</Chip>
                        <Chip onClick={selectTag}>Crit Rate</Chip>
                        <Chip onClick={selectTag}>Crit DMG</Chip>
                        <Chip onClick={selectTag}>Elemental Mastery</Chip>
                        <Chip onClick={selectTag}>Energy Recharge</Chip>
                    </div>

                    <div className={modalCSS.options}>
                        <Button onClick={toggleModal}>Cancel</Button>
                        <Button onClick={applyFilters}>Apply</Button>
                    </div>
                </Modal>
            }
        </>
    )
}

"use client"

import { useEffect, useState } from 'react'
import { useStore } from 'zustand'
import Image from 'next/image'

import explorePageCSS from '@/components/explore/explorePage.module.css'
import modalCSS from '@/components/ui/modal.module.css'

import Modal from '@/components/ui/Modal'
import Btn from '@/components/ui/Btn'
import Tag from '@/components/ui/Tag'

import { CharacterFilterStore } from '@/store/CharacterFilters'
import { WeaponFilterStore } from '@/store/WeaponFilters'
import { ArtifactFilterStore } from '@/store/ArtifactFilters'

/**
 * Header for the character browse page: contains title, filter button/modal and active tags
 * @note client-side only to allow for the use of useState and state management so user can select filters and toggle modal
 * @param props 
 * @returns 
 */
export default function CharacterBrowseHeader(props: {icon: any, title: string, filters: any}) {

    const filters = props.filters //2d array of character category filters passed in from the parent component
    //const [selectedFilters, setSelectedFilters] = useState([]) //state to store the selected filters
    const { selectedCharacterFilters: selectedFilters, setSelectedCharacterFilters: setSelectedFilters } = CharacterFilterStore()

    const [tempFilters, setTempFilters] = useState([])

    const [showModal, setShowModal] = useState(false)

    /**
     * Toggles the visibility of the modal and resets the tempFilters to the selectedFilters
     */
    const toggleModal = () => {
        setShowModal(!showModal)
        setTempFilters(selectedFilters) //clear changes
    }

    /**
     * Adds or removes a tag from the tempFilters
     * @param e - The event object
     */
    const toggleTempTag = (e) => {
        let tag = e.target.textContent //get tag label
        if(!tempFilters.includes(tag))
            setTempFilters([...tempFilters, tag]) //add tag to tempFilters
        else
            setTempFilters(tempFilters.filter((filter) => filter !== tag)) //remove tag from tempFilters
    }

    /**
     * Removes a tag from the selectedFilters
     * @param e - The event object
     * @returns void
     */
    const removeSelectedTag = (e) => {
        let tag = e.target.textContent //get tag label
        setSelectedFilters(selectedFilters.filter((filter) => filter !== tag)) //remove tag from tempFilters
    }


    return (
        <>
            <li>{JSON.stringify(filters)}</li>
            <li>{JSON.stringify(selectedFilters)}</li>
            <li>{JSON.stringify(tempFilters)}</li>


            <div className={explorePageCSS.header}>
                <div className={explorePageCSS.titleWrapper}>
                    <Image src={props.icon} alt=''/>
                    <h1 className={explorePageCSS.ingameTitle}>{props.title}</h1>
                </div>

                <div className={explorePageCSS.controller}>
                    <Btn onClick={toggleModal}> 
                        <i className="material-symbols-outlined">filter_list</i>
                        <p>Filters</p>
                    </Btn>
                </div>
            </div>

            <div className={explorePageCSS.activeTagsRail}>
                { selectedFilters.length !== 0 && <>
                    <Tag onClick={() => setSelectedFilters([])} style={{border: "none", paddingLeft: "5px"}}>Clear All</Tag>
                    
                    {selectedFilters.map((filter, index) => {
                        return <Tag key={index} selected={true} onClick={removeSelectedTag}>{filter}</Tag> 
                    })}
                </> }
            </div>

            {showModal &&  // if show is true, show the modal
                <Modal title="Filters" toggle={toggleModal}>
                    {filters.map((filterCategory, index) => {
                        const filterTitle = Object.keys(filterCategory)[0];
                        const filterArray = filterCategory[Object.keys(filterCategory)[0]];
                        return (
                            <div className={explorePageCSS.tagCatagory} key={index}>
                                <label>{filterTitle}</label>

                                {filterArray.map((tag, index) => ( 
                                    <Tag 
                                        key={`${filterTitle}-${tag}-${index}`} 
                                        onClick={toggleTempTag} 
                                        selected={tempFilters.includes(tag)}
                                    >
                                        {tag}
                                    </Tag> 
                                ))}
                            </div>
                        )
                    })}

                    <div className={modalCSS.options}>
                        <Btn onClick={toggleModal}>Cancel</Btn>
                        <Btn onClick={() => {
                            setSelectedFilters(tempFilters)
                            toggleModal()
                        }}>Apply</Btn>
                    </div>
                </Modal>
            }
        </>
    )
}

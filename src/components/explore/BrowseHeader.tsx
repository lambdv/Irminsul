"use client"
import { useEffect, useState } from 'react'
import { useStore } from 'zustand'
import Image from 'next/image'
import explorePageCSS from '@/components/explore/explorePage.module.css'
import modalCSS from '@/components/ui/modal.module.css'
import Modal from '@/components/ui/Modal'
import Btn from '@/components/ui/Btn'
import FilterBtn from '@/components/ui/FilterBtn'
import { CharacterFilterStore } from '@/store/CharacterFilters'
import { WeaponFilterStore } from '@/store/WeaponFilters'
import { ArtifactFilterStore } from '@/store/ArtifactFilters'
import RoundBtn from '../ui/RoundBtn'

/**
 * header for the character browse page: contains title, filter button/modal and active tags
 */
export default function BrowseHeader(props: {
    materialIcon?: string,
    icon?: any, 
    title: string, 
    store?: any,
    useFilter?: boolean 
}) {

    if(!(props.icon) && !(props.materialIcon))
        throw new Error("BrowseHeader: icon or materialIcon is required")

    const { filters, selectedFilters: selectedFilters, setSelectedFilters: setSelectedFilters } = props.store()

    //const filters = props.filters //2d array of character category filters passed in from the parent component
    const [tempFilters, setTempFilters] = useState([])
    const [showModal, setShowModal] = useState(false)

    //toggle model visibility
    const toggleModal = () => {
        setShowModal(!showModal)
        setTempFilters(selectedFilters) //clear changes
    }

    //toggle adding/removing a tag from the tempFilters list
    const toggleTempTag = (e) => {
        let tag = e.target.querySelector('p')?.textContent || e.target.textContent.replace('check', '').trim() //get tag label from p tag or button text, removing check icon text

        
        if(!tempFilters.includes(tag))
            setTempFilters([...tempFilters, tag]) //add tag to tempFilters
        else
            setTempFilters(tempFilters.filter((filter) => filter !== tag)) //remove tag from tempFilters
    }

    //remove a tag from the selectedFilters list
    const removeSelectedTag = (e) => {
        let tag = e.target.textContent.replace('check', '').trim() //get tag label, removing check icon text
        setSelectedFilters(selectedFilters.filter((filter) => filter !== tag)) //remove tag from tempFilters
    }

    const {descending , setDescending} = props.store()
    const toggleDescending = () => setDescending(!descending)



    return (
        <>
            <div className={explorePageCSS.header}>
                <div className={explorePageCSS.titleWrapper}>
                    {props.icon ? <Image src={props.icon} alt=''/> : <span className="material-symbols-rounded" style={{fontSize: "30px", marginRight: "5px", position: "relative", top: "5px"}}>{props.materialIcon}</span>}
                    <h1 className={explorePageCSS.ingameTitle}>{props.title}</h1>
                </div>

                <div className={explorePageCSS.controller + " flex"}>
                    {props.useFilter !== false && <Btn onClick={toggleModal}> 
                        <i className="material-symbols-rounded">filter_list</i>
                        <p>Filters</p>
                    </Btn>}
                    <RoundBtn 
                        onClick={toggleDescending}
                        icon="arrow_drop_up"
                        iconStyle={descending ? {transform: "rotate(180deg)"} : {transform: "rotate(0deg)"}}
                    />
                </div>
            </div>
            {selectedFilters.length !== 0 && <div className={explorePageCSS.activeTagsRail}>
                <FilterBtn onClick={() => setSelectedFilters([])} style={{border: "none", paddingLeft: "5px"}}>Clear All</FilterBtn>
                
                {selectedFilters.map((filter, index) => {
                    return <FilterBtn key={index} selected={true} onClick={removeSelectedTag}>{filter}</FilterBtn> 
                })}
                </div>
            }

            {showModal &&
                <Modal title="Filters" toggle={toggleModal}>
                    {filters.map((filterCategory, index) => {
                        const filterTitle = Object.keys(filterCategory)[0]
                        const filterArray = filterCategory[Object.keys(filterCategory)[0]]
                        return (
                            <div className={explorePageCSS.tagCatagory} key={index}>
                                <label>{filterTitle}</label>

                                {filterArray.map((tag, index) => ( 
                                    <FilterBtn 
                                        key={`${filterTitle}-${tag}-${index}`} 
                                        onClick={toggleTempTag} 
                                        selected={tempFilters.includes(tag)}
                                    >
                                        {tag}
                                    </FilterBtn> 
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

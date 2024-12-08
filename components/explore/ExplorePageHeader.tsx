/**
 * this page was used as the browse page header when the tags were stored in the url rather than in the state
 * will keep this code here for reference
 */
// "use client"

// import { useEffect, useState } from 'react'
// import Image from 'next/image'

// import explorePageCSS from '@/components/explore/explorePage.module.css'
// import explorePageHeaderCSS from '@/components/explore/ExplorePageHeader.module.css'

// import modalCSS from '@/components/ui/modal.module.css'

// import Modal from '@/components/ui/Modal'
// import Btn from '@/components/ui/Btn'
// import Tag from '@/components/ui/Tag'

// import { useRouter } from 'next/navigation'

// export default function ExplorePageHeader(props) {

//     const filters = props.filters

//     const selectedFilters = [... props.selectedFilters] || []

//     const router = useRouter()        
    
//     const [showModal, setShowModal] = useState(false)

//     const toggleModal = () => {
//         setShowModal(!showModal)

//     }

//     const toggleTag = (e) => {
//         let tag: string = e.target.textContent //get tag label and remove leading/trailing spaces
//         if(!selectedFilters.includes(tag)){
//             //add tag to tempFilters
//             router.replace(`?filters=${ [...selectedFilters, tag].join('+') }`)
//         } 
            
//         else
//             removeTag(e)
    
//     }

//     const removeTag = (e) => {
//         let tag = e.target.textContent //get tag label
//         //remove tag from selectedFilters
//         let newFilters = selectedFilters.filter((filter) => filter !== tag)

//         //update url
//         router.replace(`?filters=${newFilters.join('+')}`)
//     }

//     // const applyFilters = () => {
//     //     //setSelectedFilters(tempFilters)
//     //     setShowModal(false)

//     //     // change url to reflect new filters in tempFilters
//     //     router.replace(`?filters=${tempFilters}`)

//     // }

//     return (
//         <>

//             <br></br>

//             {
//                 selectedFilters
//             }

//             <nav className={explorePageCSS.header}>
//                 <div className='flex'>
//                     <Image src={props.icon} alt=''/>
//                     <h1 className={explorePageCSS.ingameTitle}>{props.title}</h1>
//                 </div>

//                 <div className={explorePageCSS.controller}>
//                     <Btn onClick={toggleModal}> 
//                         <i className="material-symbols-outlined">filter_list</i>
//                         <p>Filters</p>
//                     </Btn>
//                 </div>
//             </nav>

//             {/* <div className={explorePageCSS.activeTagsRail + ` flex`}>
//                 {selectedFilters.map((filter, index) => {
//                     return <Tag key={index} selected={true} onClick={removeTag}>{filter}</Tag> 
//                 })}
//             </div> */}

//             {showModal &&  // if show is true, show the modal
//                 <Modal title="Filters" toggle={toggleModal} apply={toggleModal}>
                    
//                     {filters.map((filterCategory, index) => {
//                         const filterTitle = Object.keys(filterCategory)[0];
//                         const filterArray = filterCategory[Object.keys(filterCategory)[0]];
//                         return (
//                             <div className={explorePageCSS.tagCatagory} key={index}>
//                                 <label>{filterTitle}</label>

//                                 {filterArray.map((tag, index) => ( 
//                                     <Tag 
//                                         key={`${filterTitle}-${tag}-${index}`} 
//                                         onClick={toggleTag} 
//                                         selected={selectedFilters.includes(tag)}
//                                     >
//                                         {tag}
//                                     </Tag> 
//                                 ))}
//                             </div>
//                         )
//                     })}

//                     <div className={modalCSS.options}>
//                         <Btn onClick={toggleModal}>Cancel</Btn>
//                         <Btn onClick={toggleModal}>Apply</Btn>
//                     </div>
//                 </Modal>
//             }
//         </>
//     )
// }

"use client"
import React, { useState, useEffect, useRef }  from 'react'
import { getAllPages, getArtifacts, getCharacters, getWeapons } from '@/utils/genshinData'
import SearchPaletteCSS from './searchpallette.module.css'
import Image from 'next/image'
import { SearchStore } from '@/store/Search'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { toKey } from '@/utils/standardizers'
import { getAssetURL } from '@/utils/getAssetURL'
import RoundBtn from '../ui/RoundBtn'

export default function SearchPallete() {
    const router = useRouter()
    const {SearchQuery, setSearchQuery, setFirstKeyPress, firstKeyPress} = SearchStore()
    const [pages, setPages] = useState<Page[]>([])
    const searchBarRef = useRef<HTMLInputElement | null>(null)
    const { setShowPallette } = SearchStore()
    const [results, setResults] = useState<Page[]>([])

    useEffect(() => {
        const res = pages
        .filter(r => r.name
            .toLowerCase()
            .includes(SearchQuery.toLowerCase())
        )
        setResults(res)

    }, [SearchQuery, pages])    
    
    const closePalette = () => {
        setShowPallette(false)
    }

    //loads pages state from server action
    useEffect(() => {
        (async () => {
            const ps = await getAllPages()
            setPages(ps)
        })()
    }, [])

    // focus the search bar when the component mounts
    useEffect(() => {
        setTimeout(() => {
            searchBarRef.current?.focus()
            //highlight the text in the search bar
            if(SearchQuery.length > 1){
                searchBarRef.current?.setSelectionRange(0, SearchQuery.length)
            }
        }, 10)
    }, [])

    //handle keyboard events
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            switch(event.key){
                case 'Escape':
                    setShowPallette(false)
                    break
                case 'Enter':
                    if(SearchQuery.length === 0)
                        break
                    const firstResult = results[0]
                    if (firstResult){
                        router.push('/archive/'+firstResult.category.toLowerCase()+'s/'+toKey(firstResult.name))
                        setShowPallette(false)
                    }
                    break
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => {window.removeEventListener('keydown', handleKeyDown)}
    })

    /**
     * link component for each search result in the palette
     * @param item 
     * @returns 
     */
    function ResultItemComponent(item: Page, highlighted: boolean) {
        let fileName = ""

        switch(item.category.toLowerCase()){
            case "character":
                fileName = `avatar.png`
                break
            case "weapon":
                //fileName = `baseicon.png`
                fileName = `base_avatar.png`
                break
            case "artifact":
                fileName = `flower.png`
                break
        }

        const imgURL = getAssetURL(item.category, item.name, fileName)

        return (
            <Link 
                key={item.id} 
                className={`${SearchPaletteCSS.palletteResult} ${highlighted ? SearchPaletteCSS.highlighted : ""}`} 
                href={`/archive/${item.category.toLowerCase()}s/${item.id}`}
                onClick={closePalette}
            >
                <Image src={imgURL} alt="" width={100} height={100} unoptimized/>
                <p>{item.name}</p>
            </Link>
        )
    }
    

    return (
        <div className={SearchPaletteCSS.searchPalette}>
            <div className={SearchPaletteCSS.searchBar + " flex justify-between items-center"}>
                <RoundBtn
                    icon="arrow_back"
                    onClick={closePalette}
                    style={{width: "40px", height: "35px", fontSize: "20px"}}
                    iconStyle={{fontSize: "20px", color: "#a5a5a5"}}
                />

                <input 
                    ref={searchBarRef}  // Attach ref to the input element
                    className={SearchPaletteCSS.searchBar}
                    type="text" 
                    placeholder="Search..." 
                    value={SearchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {
                    SearchQuery.length > 0 &&
                    <RoundBtn
                        icon="close"
                        onClick={() => setSearchQuery("")}
                        style={{width: "40px", height: "35px", fontSize: "20px"}}
                        iconStyle={{fontSize: "20px", color: "#a5a5a5"}}
                    />
                }

            </div>
            <ul className={SearchPaletteCSS.searchPaletteResults}>
                
                {SearchQuery.length > 0 ? 
                    <>
                        <p style={{color: "#787878", fontSize: "12px", marginLeft: "10px", marginBottom: "10px", paddingLeft: "0px"}}>{results.length} results</p>
                        {results.map((item, index) => 
                            ResultItemComponent(item, index === 0)
                        )}
                    </>
                : 
                    <>
                        <Link className={SearchPaletteCSS.palletteResult} onClick={closePalette} href="/"><p>Home</p></Link>
                        <Link className={SearchPaletteCSS.palletteResult} onClick={closePalette} href="/characters"><p>Characters</p></Link>
                        <Link className={SearchPaletteCSS.palletteResult} onClick={closePalette} href="/weapons"><p>Weapons</p></Link>
                        <Link className={SearchPaletteCSS.palletteResult} onClick={closePalette} href="/artifacts"><p>Artifacts</p></Link>
                    </>
                }
            </ul>
        </div>
  )
}


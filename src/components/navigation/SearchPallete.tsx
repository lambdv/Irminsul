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
import { Page } from '@/types/page'

const alterntiveNamesMapping = [
    { "Tartaglia": ["childe", "ajax"]},
    { "Tenacity of the Millelith": ["tom"]},
    { "Fleuve Cendre Ferryman": ["pipe"]},
]
export default function SearchPallete() {
    const router = useRouter()
    const {SearchQuery, setSearchQuery, setFirstKeyPress, firstKeyPress} = SearchStore()
    const [pages, setPages] = useState<Page[]>([])
    const searchBarRef = useRef<HTMLInputElement | null>(null)
    const { setShowPallette } = SearchStore()
    const [results, setResults] = useState<Page[]>([])
    const [highlightedIndex, setHighlightedIndex] = useState<number>(0)


    function foundMatch(query: string, page: Page){
        const pageName = page.name.toLowerCase()
        const queryLower = query.toLowerCase()
        
        // Check for exact match first, preserving spaces
        if (pageName.includes(queryLower)) {
            return true
        }

        // Check alternative names
        const alternativeNames = alterntiveNamesMapping.find(mapping => 
            Object.keys(mapping)[0] === page.name
        )
        if (alternativeNames) {
            const aliases = Object.values(alternativeNames)[0]
            if (aliases.some(alias => alias.toLowerCase().includes(queryLower))) {
                return true
            }
        }

        // Split into words for acronym and word matching
        const pageWords = pageName.split(' ')
        const queryWords = queryLower.split(' ')

        // Check for acronym match (e.g. both "ttods" and "ttds" match "Thrilling Tales of Dragon Slayers")
        const acronyms = [
            pageWords.map(word => word[0]).join(''), // Full acronym
            pageWords.map(word => word[0]).filter(c => c !== 'o').join('') // Acronym without 'o'
        ]
        if (acronyms.some(acronym => acronym.includes(queryLower))) {
            return true
        }

        // Generate common abbreviations (e.g. "xq" for "xingqiu")
        const abbreviations = pageWords.map(word => {
            // Take first letter and first consonant after first letter
            const letters = word.split('')
            const firstLetter = letters[0]
            const secondConsonant = letters.slice(1).find(c => !'aeiou'.includes(c))
            return firstLetter + (secondConsonant || '')
        }).join('')

        // Check if query matches start of any word or abbreviation
        if (pageWords.some(word => word.toLowerCase().startsWith(queryLower)) || 
            abbreviations.toLowerCase().includes(queryLower)) {
            return true
        }

        // Check if all query words (including spaces) match parts of words in sequence
        let currentPos = 0
        for (const queryWord of queryWords) {
            // Look for match starting from current position
            let found = false
            while (currentPos < pageName.length) {
                if (pageName.slice(currentPos).startsWith(queryWord)) {
                    currentPos += queryWord.length
                    found = true
                    break
                }
                currentPos++
            }
            if (!found) return false
        }
        return true
    }

    useEffect(() => {
        //optmistic update for search bar value
        setSearchQuery(SearchQuery)


        const res = pages

            .filter(r => foundMatch(SearchQuery, r))
        setResults(res);

    }, [SearchQuery, pages, setSearchQuery])    
    
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
                        setSearchQuery("")
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
                className={`${SearchPaletteCSS.palletteResult} ${highlighted && SearchPaletteCSS.highlighted}`} 
                href={`/archive/${item.category.toLowerCase()}s/${item.id}`}
                onClick={(e) => {
                    closePalette()
                    setSearchQuery("")
                }}

            >
                <Image src={imgURL} alt="" width={100} height={100} unoptimized/>
                <p>
                    {(() => {
                        const foundMatch = item.name.toLowerCase().indexOf(SearchQuery.toLowerCase());
                        if (foundMatch === -1) return item.name;
                        
                        const before = item.name.slice(0, foundMatch);
                        const match = item.name.slice(foundMatch, foundMatch + SearchQuery.length);
                        const after = item.name.slice(foundMatch + SearchQuery.length);
                        
                        return (
                            <>
                                {before}
                                <span style={{backgroundColor: 'var(--primary-color)', borderRadius: '2px', padding: '0px'}}>
                                    {match}
                                </span>
                                {after}
                            </>
                        );
                    })()}
                </p>
                {highlighted && <i className="material-symbols-outlined " style={{marginLeft: "auto", color: "#b1b1b1", fontSize: "18px", marginRight: "5px"}}>keyboard_return</i>}
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
                        <Link className={SearchPaletteCSS.palletteResult} onClick={closePalette} href="/archive/characters"><p>Characters</p></Link>
                        <Link className={SearchPaletteCSS.palletteResult} onClick={closePalette} href="/archive/weapons"><p>Weapons</p></Link>
                        <Link className={SearchPaletteCSS.palletteResult} onClick={closePalette} href="/archive/artifacts"><p>Artifacts</p></Link>
                    </>
                }
            </ul>
        </div>
  )
}


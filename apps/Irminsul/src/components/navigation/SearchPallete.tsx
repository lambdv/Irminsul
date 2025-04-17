"use client"
import React, { useState, useEffect, useRef }  from 'react'
import { getAllPages } from '@/utils/genshinData'
import SearchPaletteCSS from './searchpallette.module.css'
import Image from 'next/image'
import { SearchStore } from '@/store/Search'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { toKey } from '@/utils/standardizers'
import { getAssetURL } from '@/utils/getAssetURL'
import RoundBtn from '../ui/RoundBtn'
import { Page } from '@/types/page'
import Fuse from 'fuse.js'
import assert from 'assert'

/**
 * Modal that overlays the screen, containg a search bar and a list of results
 */
export default function SearchPallete() {
    const router = useRouter()
    const {SearchQuery, setSearchQuery, setFirstKeyPress, firstKeyPress} = SearchStore()
    const searchBarRef = useRef<HTMLInputElement | null>(null)
    //const [pages, setPages] = useState<Page[]>([])
    const { setShowPallette } = SearchStore()
    const [results, setResults] = useState<Page[]>([])
    const [fuse, setFuse] = useState<Fuse<Page> | null>(null) ///use fuse.js to search the pages
    const closePalette = () => setShowPallette(false)
    
    //loads pages
    useEffect(() => {
        (async () => { // in use effect because its async and this is a client component
            const pages = await getAllPages()
            //setPages(pages)
            assert(pages, "pages is not initialized")
            setFuse(new Fuse(pages, {
                keys: ['name', 'category'],
                threshold: 0.3,
                includeScore: true,
                ignoreLocation: true,
                useExtendedSearch: true,
            }))
        })()
    }, [])

    //update the search query
    useEffect(() => {
        setSearchQuery(SearchQuery)
        //setResults(pages.filter(page => foundMatch(SearchQuery, page)))
        if(!fuse) return
        const searchResults = fuse.search(SearchQuery)
        setResults(searchResults.map(result => result.item))
    }, [SearchQuery, fuse])    
    


    //focus the search bar this component mounts
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
        const handleKeyDown = (e: KeyboardEvent) => {
            switch(e.key){
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
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    })

    return (
        <div className={SearchPaletteCSS.searchPalette}>
            <div className={SearchPaletteCSS.searchBar}>

                <RoundBtn 
                    icon="arrow_back" 
                    onClick={closePalette} 
                    style={{width: "40px", height: "35px", fontSize: "20px"}} 
                    iconStyle={{fontSize: "20px", color: "#a5a5a5"}}
                    />
                
                <input 
                    ref={searchBarRef} 
                    className={SearchPaletteCSS.searchBar} 
                    type="text" 
                    placeholder="Search..." 
                    value={SearchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                {SearchQuery.length > 0 &&
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
                            ResultItemComponent(item, index === 0, closePalette, setSearchQuery)
                        )}
                    </>
                : 
                    <>{[
                        {name: "Home", href: "/"},
                        {name: "Ask AI", href: "/seelie"},
                        {name: "Characters", href: "/archive/characters"},
                        {name: "Weapons", href: "/archive/weapons"},
                        {name: "Artifacts", href: "/archive/artifacts"},
                        {name: "Articles", href: "/articles"},
                        {name: "Support", href: "/support"},
                        {name: "Settings", href: "/settings"},
                    ].map((item, index) => 
                        <Link key={index} className={SearchPaletteCSS.palletteResult} onClick={closePalette} href={item.href}><p>{item.name}</p></Link>
                    )}
                    </>
                }
            </ul>
        </div>
    )
}   

const alterntiveNamesMapping = [
    { "Tartaglia": ["childe", "ajax"]},
    { "Tenacity of the Millelith": ["tom"]},
    { "Fleuve Cendre Ferryman": ["pipe"]},
]

   /**
     * link component for each search result in the palette
     * @param item 
     * @returns 
     */
   function ResultItemComponent(item: Page, highlighted: boolean, closePalette: () => void, setSearchQuery: (query: string) => void) {
    let fileName = (() => {
        switch(item.category.toLowerCase()){
            case "character": return `avatar.png`
            case "weapon": return `base_avatar.png`
            case "artifact": return `flower.png`
            default: throw new Error("Invalid category")
        }
    })()    

   

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
            {/* <Image src={imgURL} alt="" width={100} height={100} unoptimized/> */}
            <p>{item.name}</p>
            {highlighted && <i className="material-symbols-outlined " style={{marginLeft: "auto", color: "#b1b1b1", fontSize: "18px", marginRight: "5px"}}>keyboard_return</i>}
        </Link>
    )
}
function foundMatch(query: string, page: Page){
    // If query is empty, return all results
    if (!query.trim()) return true;
    
    const pageName = page.name.toLowerCase()
    const queryLower = query.toLowerCase().trim()
    
    // Check for exact match first, preserving spaces (fastest check)
    if (pageName.includes(queryLower)) {
        return true
    }

    // Split query and page name into words once for reuse
    const pageWords = pageName.split(' ')
    const queryWords = queryLower.split(' ')

    // Check if query matches start of any word (common and fast check)
    if (pageWords.some(word => word.startsWith(queryLower))) {
        return true
    }

    // Check alternative names (only if we haven't found a match yet)
    const alternativeNames = alterntiveNamesMapping.find(mapping => 
        Object.keys(mapping)[0] === page.name
    )
    if (alternativeNames) {
        const aliases = Object.values(alternativeNames)[0]
        if (aliases.some(alias => alias.toLowerCase().includes(queryLower))) {
            return true
        }
    }

    // Generate acronyms only once
    const acronym = pageWords.map(word => word[0]).join('')
    const acronymNoO = pageWords.map(word => word[0]).filter(c => c !== 'o').join('')
    
    // Check for acronym match
    if (acronym.includes(queryLower) || acronymNoO.includes(queryLower)) {
        return true
    }

    // Generate abbreviation only if needed
    const abbreviations = pageWords.map(word => {
        if (!word) return '';
        const firstLetter = word[0];
        // Find first consonant after first letter without creating a new array
        let secondConsonant = '';
        for (let i = 1; i < word.length; i++) {
            if (!'aeiou'.includes(word[i])) {
                secondConsonant = word[i];
                break;
            }
        }
        return firstLetter + (secondConsonant || '');
    }).join('');

    // Check if abbreviation includes query
    if (abbreviations.toLowerCase().includes(queryLower)) {
        return true;
    }

    // Fuzzy matching - optimized to exit early when possible
    let pageIndex = 0;
    let matchCount = 0;
    const minMatchRequired = queryLower.length * 0.7;
    
    for (let queryIndex = 0; queryIndex < queryLower.length; queryIndex++) {
        // Early exit if we can't possibly reach the required match count
        if (matchCount + (queryLower.length - queryIndex) < minMatchRequired) {
            break;
        }
        
        const char = queryLower[queryIndex];
        let found = false;
        
        // Look for this character in the remaining part of the page name
        while (pageIndex < pageName.length) {
            if (pageName[pageIndex] === char) {
                matchCount++;
                pageIndex++;
                found = true;
                break;
            }
            pageIndex++;
        }
        
        // If we couldn't find the character, no need to continue
        if (!found) break;
    }
    
    // If we matched at least 70% of the query characters in order, consider it a match
    if (matchCount >= minMatchRequired) {
        return true;
    }

    // Check if all query words match parts of words in sequence
    let currentPos = 0;
    for (const queryWord of queryWords) {
        if (!queryWord) continue; // Skip empty words
        
        // Look for match starting from current position
        let found = false;
        const maxPos = pageName.length - queryWord.length;
        
        while (currentPos <= maxPos) {
            if (pageName.slice(currentPos).startsWith(queryWord)) {
                currentPos += queryWord.length;
                found = true;
                break;
            }
            currentPos++;
        }
        
        if (!found) return false;
    }
    
    return true;
}

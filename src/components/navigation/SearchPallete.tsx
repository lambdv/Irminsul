"use client"
import React, { useState, useEffect, useRef }  from 'react'
import { getArtifacts, getCharacters, getWeapons } from '@/utils/DataGetters'
import SearchPaletteCSS from './searchpallette.module.css'
import Image from 'next/image'
import { SearchStore } from '@/store/Search'
import { useRouter } from 'next/navigation'
import Link from "next/link"


type ResultItem = {
    id: number
    name: string
    rarity: number
    category: string
}

export default function SearchPallete() {
    const [SearchQuery, setSearchQuery] = useState("")
    const [results, setResults] = useState<ResultItem[]>([])
    const searchBarRef = useRef<HTMLInputElement | null>(null)
    const { setShowPallette } = SearchStore()
    const router = useRouter()

    // Fetch data and flatten it into a single array
    useEffect(() => {
        const getDatas = async () => {
            const jsonToResultItem = (json: any, category: string) => 
                json.map((item: any) => ({
                    id: item.id, 
                    name: item.name, 
                    rarity: item.rarity, 
                    category: category
                }))
            const characters = jsonToResultItem(await getCharacters(), "Character")
            const weapons = jsonToResultItem(await getWeapons(), "Weapon")
            const artifacts = jsonToResultItem(await getArtifacts(), "Artifact")
            setResults([...characters, ...weapons, ...artifacts])
        }
        getDatas()

        // Focus the search bar when the component mounts
        setTimeout(() => {
            searchBarRef.current?.focus()
        }, 10)
    }, [])

    // Handle keyboard events
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            switch(event.key){
                case 'Escape':
                    setShowPallette(false)
                    break
                case 'Enter':
                    const firstResult = results.find(r => r.name.toLowerCase().includes(SearchQuery.toLowerCase()))
                    if (firstResult){
                        router.push('/'+firstResult.category.toLowerCase()+'s/'+firstResult.id)
                        setShowPallette(false)
                    }
                    break
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => {window.removeEventListener('keydown', handleKeyDown)}
    })

    function ResultItemComponent(item: ResultItem) {
        const imgName = item.category=="artifact" ? "flower" : "profile" 
        const imgURL = `/assets/${item.category.toLowerCase()}s/${item.id}/${imgName}.png`
        
        return (
            <Link 
                key={item.id} 
                className={SearchPaletteCSS.palletteResult} 
                href={`/${item.category.toLowerCase()}s/${item.id}`}
                onClick={() => setShowPallette(false)}
            >
                <Image src={imgURL} alt="" width={100} height={100} />
                <p>{item.name}</p>
            </Link>
        )
    }
    

    return (
        <div className={SearchPaletteCSS.searchPalette}>
            <input 
                ref={searchBarRef}  // Attach ref to the input element
                className={SearchPaletteCSS.searchBar}
                type="text" 
                placeholder="Search..." 
                value={SearchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <ul className={SearchPaletteCSS.searchPaletteResults}>
                {SearchQuery.length > 0 ?
                    results
                        .filter(r => r.name.toLowerCase().includes(SearchQuery.toLowerCase()))
                        .map(ResultItemComponent)
                    :
                    <>
                        <a className={SearchPaletteCSS.palletteResult} href="/"><p>Home</p></a>
                        <a className={SearchPaletteCSS.palletteResult} href=""><p></p></a>
                        <a className={SearchPaletteCSS.palletteResult} href=""><p></p></a>
                        <a className={SearchPaletteCSS.palletteResult} href=""><p></p></a>
                    </>
                }
            </ul>
        </div>
  )
}


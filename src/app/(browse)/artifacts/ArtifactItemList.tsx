"use client"
import explorePageCSS from '@/components/explore/explorePage.module.css'
import Item from '@/components/explore/Item'
import { SearchStore } from '@/store/Search'
import { ArtifactFilterStore } from '@/store/ArtifactFilters'
import { filterItemList } from '@/utils/filterers'
import { flatten, toKey } from '@/utils/standardizers'
import { useEffect, useState } from 'react'

function filterArtifacts(artifacts: any, filters2d: any, selectedFilters: string[], query: string){
    if(selectedFilters.length === 0 && query.length === 0)
        return artifacts

    return artifacts.filter((artifact) => { //for each character
        const tags: string[] = [artifact.rarity_max+"-star"] //tags for this character
        const passed: boolean = filters2d.every((filter) => { //for each filter category
            const subset = selectedFilters.filter((tag) => filter.includes(tag))
            if(subset.length === 0) return true //skip if selectedFilters doesn't have any tags for this category
            return subset.some((tag) => tags.includes(tag)) //check if character has at least one tag from this category
        })
        const nameMatch: boolean = query==="" || artifact.name.toLowerCase().includes(query.toLowerCase())
        return passed && nameMatch
    })
}

export default function ArtifactItemList(props) {
    const artifacts: any[] = props.data
    const { SearchQuery } = SearchStore()
    const { selectedFilters, filters, descending } = ArtifactFilterStore()
    const itemTaggingFunction = (artifact: any) => [artifact.rarity+"-star"]
    const filters2d = [filters[0].rarities]
    const [sortBy, setSortBy] = useState("release_version")
    const [filteredArtifacts, setFilteredArtifacts] = useState<any[]>([])

    const sortingFn = (a, b) => { 
        switch(sortBy){
            case "release_version":
                const versionDiff = (a.release_version - b.release_version);        
                if (versionDiff !== 0) 
                    return versionDiff
                const rarityDiff = a.rarity_max - b.rarity_max
                if (rarityDiff !== 0) 
                    return rarityDiff
                return a.name.localeCompare(b.name)
            default:
                return a[sortBy].localeCompare(b[sortBy])           
        }
    }

    useEffect(() => {
        const filtered = filterArtifacts(artifacts, filters2d, selectedFilters, SearchQuery)
        setFilteredArtifacts(filtered)
    }, [filters, selectedFilters, SearchQuery])
    
    return (
        <div className={explorePageCSS.itemContainer}>
            {filteredArtifacts.length === 0 && <p>No results for {SearchQuery}</p>}
            {filteredArtifacts
                .sort(descending ? (a, b) => sortingFn(b, a) : sortingFn)
                .map((artifact, index) => (
                    <Item
                        key={index} 
                        category="artifact"
                        name={artifact.name}
                        rarity={artifact.rarity_max}
                        src={`/assets/artifacts/${toKey(artifact.name)}/${toKey(artifact.name)}_flower.png`}
                        alt={toKey(artifact.name)}
                    />
                ))}
        </div>
    )
}
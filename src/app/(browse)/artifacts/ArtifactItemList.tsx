"use client"
import explorePageCSS from '@/components/explore/explorePage.module.css'
import Item from '@/components/explore/Item'
import { SearchStore } from '@/store/Search'
import { ArtifactFilterStore } from '@/store/ArtifactFilters'
import { filterItemList, sortItems } from '@/utils/filterers'
import { flatten, toKey } from '@/utils/standardizers'
import { useEffect, useState } from 'react'

export default function ArtifactItemList(props) {
    const artifacts: any[] = props.data
    const { SearchQuery } = SearchStore()
    const { selectedFilters, filters, descending } = ArtifactFilterStore()
    const [sortBy, setSortBy] = useState("release_version")
    
    const [filteredArtifacts, setFilteredArtifacts] = useState<any[]>(artifacts)
    useEffect(() => {
        const filters2d = [filters[0].rarities]
        const itemTaggingFunction = (artifact) => [artifact.rarity_max+"-star"]
        const filtered = filterItemList(artifacts, filters2d, selectedFilters, SearchQuery, itemTaggingFunction)
        setFilteredArtifacts(filtered)
    }, [artifacts, filters, selectedFilters, SearchQuery])
    
    return (
        <div className={explorePageCSS.itemContainer}>
            {filteredArtifacts
                .sort((a,b)=>sortItems(a, b, sortBy, descending))
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
                {filteredArtifacts.length === 0 && <p>No artifacts found </p>}
        </div>
    )
}
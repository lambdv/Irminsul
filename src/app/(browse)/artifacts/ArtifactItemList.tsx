"use client"
import explorePageCSS from '@/components/explore/explorePage.module.css'
import Item from '@/components/explore/Item'
import { SearchStore } from '@/store/Search'
import { ArtifactFilterStore } from '@/store/ArtifactFilters'
import { filterItemList } from '@/utils/filterers'
import { flatten } from '@/utils/standardizers'
import { useState } from 'react'


// function filterArtifacts(artifacts: any, filters: any, selectedFilters: string[], query: string){
//     if(selectedFilters.length === 0 && query.length === 0)
//         return artifacts
//     const filters2d = [filters[0].rarities]

//     return artifacts.filter((artifact) => { //for each character
//         const tags: string[] = [artifact.max_rarity+"-star"] //tags for this character
//         const passed: boolean = filters2d.every((filter) => { //for each filter category
//             const subset = selectedFilters.filter((tag) => filter.includes(tag))
//             if(subset.length === 0) return true //skip if selectedFilters doesn't have any tags for this category
//             return subset.some((tag) => tags.includes(tag)) //check if character has at least one tag from this category
//         })
//         const nameMatch: boolean = query==="" || artifact.name.toLowerCase().includes(query.toLowerCase())
//         return passed && nameMatch
//     })
// }


export default function ArtifactItemList(props) {
    const artifacts: any[] = props.data
    const { SearchQuery } = SearchStore()
    const { selectedFilters, filters, descending } = ArtifactFilterStore()
    const itemTaggingFunction = (artifact: any) => [artifact.rarity+"-star"]
    const filters2d = [filters[0].rarities]

    const [sortBy , setSortBy] = useState("name")
    
    

    return (
        <div className={explorePageCSS.itemContainer}>
            {filterItemList(artifacts, filters2d, selectedFilters, SearchQuery, itemTaggingFunction)
                .sort((a, b) => a[sortBy].localeCompare(b[sortBy]) * (descending ? -1 : 1))
                .map((artifact, index) => (
                    <Item
                        key={index} 
                        category="artifact"
                        name={artifact.name}
                        rarity={artifact.max_rarity}
                        src={`/assets/artifacts/${artifact.name.toLowerCase().replaceAll(" ", "-")}/flower.png`}
                    />
                ))}
        </div>
    )
}
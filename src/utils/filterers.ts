import {flatten} from "./standardizers"

export function filterItemList(characters: any, filters: string[][], selectedFilters: string[], query: string, itemTaggingFunction: (item: any)=> string[]){
    if(selectedFilters.length === 0 && query.length === 0)
        return characters
    return characters.filter((character) => { //for each character
        //const tags: string[] = [flatten(character.rarity+"-star"), flatten(character.vision), flatten(character.subStat), flatten(character.weapon)] //tags for this character
        const tags = itemTaggingFunction(character).map((tag) => flatten(tag))
        const passed: boolean = filters.every((filter) => {
            let subset = selectedFilters.filter((tag) => filter.includes(tag))
            subset = subset.map((tag)=>flatten(tag))
            
            if(subset.length === 0) //skip if selectedFilters doesn't have any tags for this category 
                return true 
            return subset.some((tag) => tags.includes(tag)) //check if character has at least one tag from this category
        })
        const nameMatch: boolean = query==="" || character.name.toLowerCase().includes(query.toLowerCase())
        return passed && nameMatch
    })
}

export function sortItems(a: any, b: any, sortBy: string, descending: boolean){
    if(descending) 
        [a, b] = [b, a]
    switch(sortBy){
        case "release_version":
            return (a.release_version - b.release_version) || (a.rarity_max - b.rarity_max) || a.name.localeCompare(b.name)
        case "name":
            return a.name.localeCompare(b.name)
        case "release_date_epoch":
            return (Number(a.release_date_epoch) - Number(b.release_date_epoch)) || (a.rarity - b.rarity) || a.name.localeCompare(b.name)
        case "release_date":
            return (new Date(a.release_date).getTime() - new Date(b.release_date).getTime()) || (a.rarity - b.rarity) || a.name.localeCompare(b.name)
        default:
            return a[sortBy].localeCompare(b[sortBy])
    }
}
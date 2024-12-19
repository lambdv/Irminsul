"use client"
import { getArtifacts, getCharacters, getWeapons } from '@/utils/DataGetters';
import React, { 
    useState, 
    useEffect
}  from 'react'

type ResultItem = {
    id: number;
    name: string;
    rarity: number;
    category: string;
}

export default function SearchPallet() {
    const [SearchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<ResultItem[]>([]);

    //get all data from db and flatten it into a single array of result item objects
    useEffect(() => {
        const getDatas = async () => {
            const jsonToResultItem = (json: any, category: string) => 
                json.map((item: any) => ({id: item.id, name: item.name, rarity: item.rarity, category: category}))
            const characters = jsonToResultItem(await getCharacters(), "Character");
            const weapons = jsonToResultItem(await getWeapons(), "Weapon");
            const artifacts = jsonToResultItem(await getArtifacts(), "Artifact");
            setResults([...characters, ...weapons, ...artifacts]);
        }
        getDatas();
    },[])

    /**
     * Result component used in the search pallet
     */
    function ResultItemComponent(item: ResultItem){
        return (
            <li key={item.id}>
                <a href={`/${item.category.toLowerCase()}s/${item.id}`}>
                    {item.name} - {item.category} - {item.rarity} stars
                </a>
            </li>
        )
    }

    return (
        <>
            <input 
                type="text" 
                placeholder="Search..." 
                value={SearchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <ul id="results">
                {results
                    .filter(r => r.name.toLowerCase().includes(SearchQuery.toLowerCase()))
                    .map(ResultItemComponent)
                }
            </ul>
        </>
  )
}

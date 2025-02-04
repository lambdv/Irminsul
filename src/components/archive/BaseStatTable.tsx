import React from 'react';
import { CharacterAscensionCost, CharacterBaseStat } from '@/types/character';
import Table from './Table';
import Item from '../explore/Item';
import { getAssetURL } from '@/utils/getAssetURL';
import { toKey } from '@/utils/standardizers';

export default function BaseStatTable(props: {table: CharacterBaseStat[], cost?: CharacterAscensionCost[]}) {
    const ascensionStatType = props.table[0].AscensionStatType;
    const headers = Object.keys(props.table[0])
        .filter(key => key !== "AscensionStatType");
        
    const displayHeaders = headers
        .map(key => key === "AscensionStatValue" ? ascensionStatType : key)
        .map(key => key === "AscensionPhase" ? "Ascention" : key)
        .concat(props.cost && ["Cost"])

    return (
        <Table 
            header={displayHeaders.map((key, i) => <th key={i} className="font-bold">{key}</th>)}
            body={props.table.map((row, index) => (
                <tr key={index}>
                    {headers.map((key, j) => { 
                        return <td key={j}>{row[key]}</td>
                    })}
                    {props.cost && 
                        <td className="flex flex-wrap gap-2" style={{padding: "2px"}}>
                            {props.cost.find(c => c.AscensionPhase === row.AscensionPhase)?.materials?.map((material, idx) => {    
                                return index % 2 === 1 ? 
                                    <Item
                                        key={idx} 
                                        category="character"
                                        element={null}
                                        alt={material.name}
                                        name={material.amount} 
                                        src={`https://cdn.wanderer.moe/cdn-cgi/image/width=128,quality=50/genshin-impact/items/${toKey(material.name)}.png`}
                                        href={`https://genshin-impact.fandom.com/wiki/${material.name}`}
                                        rarity={getCharacterItemCostRarityByIdx(idx, row.AscensionPhase)}
                                        scale={0.5}
                                        style={{margin: "0px"}}
                                        showStars={false}
                                    />
                                    : <React.Fragment key={idx}></React.Fragment>
                            })}
                        </td>
                    }
                </tr>
            ))}
        />
    );
}


function getCharacterItemCostRarityByIdx(idx: number, ascensionPhase: number){
    let rarity = 0
    switch(idx){
        case 0: 
            rarity = 5; 
            break
        case 1:
            if(ascensionPhase == 0) rarity = 2;
            else rarity = 4;
            break
        case 2:
            if(ascensionPhase == 0) rarity = 1;
            else if(ascensionPhase == 1) rarity = 3;
            else if(ascensionPhase == 2) rarity = 3;
            else if(ascensionPhase == 3) rarity = 4;
            else if(ascensionPhase == 4) rarity = 4;
            else if(ascensionPhase == 5) rarity = 5;
            else if(ascensionPhase == 6) rarity = 5;
            break
        case 3:
            rarity = 1;
            break
        case 4:
            if(ascensionPhase == 1) rarity = 1;
            else if(ascensionPhase == 2) rarity = 2;
            else if(ascensionPhase == 3) rarity = 2;
            else if(ascensionPhase == 4) rarity = 3;
            else if(ascensionPhase == 5) rarity = 3;
            break

    }
    return rarity
}

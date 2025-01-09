import React from 'react';
import { CharacterAscensionCost, CharacterBaseStat } from '@/types/character';
import Table from './Table';

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
                        <td className="flex flex-wrap gap-2">
                            {props.cost.find(c => c.AscensionPhase === row.AscensionPhase)?.materials?.map((material, idx) => {
                                return index % 2 === 1 ? 
                                    <div key={idx}>{material.name}: {material.amount}</div> 
                                    : <div key={idx}></div>
                            })}
                        </td>
                    }
                </tr>
            ))}
        />
    );
}
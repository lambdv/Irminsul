import StatTableCSS from './stattable.module.css'

interface Material {
    name: string;
    amount: string;
}

interface Cost {
    AscensionStatType: string;
    materials: Material[];
}

export default async function StatTable(props: {table: any, cost?: any[]}) {
    const AscensionStatType = props.table[0].AscensionStatType
    const header = Object.keys(props.table[0])
    const filteredHeader = header.filter(key => key !== "AscensionStatType")
    const reorderedHeader = filteredHeader.sort((a, b) => {
        if (a === "LVL") return -1;
        if (b === "LVL") return 1;
        if (a === "AscensionPhase") return -1;
        if (b === "AscensionPhase") return 1;
        return 0;
    });

    const displayHeader = reorderedHeader.map(key => 
        key === "AscensionStatValue" ? AscensionStatType :
        key === "AscensionPhase" ? "Ascention" : key
    )    
    return (
        <table className={StatTableCSS.stattable}>
            <thead>
                <tr>
                    {displayHeader.map((key, index) => <th key={index} className="font-bold">{key}</th>)}
                    {props.cost && <th className="font-bold">Cost</th>}
                </tr>
            </thead>
            <tbody>
                {props.table.map((row, index) => (
                    <tr key={index}>

                        {filteredHeader.map((key, cellIndex) => 
                            <td key={cellIndex}>{row[key]}</td>
                        )}

                        {props.cost && <td>
                            {(() => {
                                const matchingCost = props.cost.find(cost => 
                                    cost["AscensionPhase"] === row["AscensionPhase"]
                                );
                                
                                // Check if there are no more rows after this one with the same ascension phase
                                const laterRowsWithSamePhase = props.table.slice(index + 1)
                                    .some(r => r["AscensionPhase"] === row["AscensionPhase"]);
                                const isLastWithPhase = !laterRowsWithSamePhase;
                                
                                if (!matchingCost?.materials || !isLastWithPhase)
                                    return '';
                                
                                return matchingCost.materials.map((material: any, idx: number) => (
                                    <div key={idx}>
                                        {material.name}: {material.amount}
                                    </div>
                                ));
                            })()}
                        </td>}
                        
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
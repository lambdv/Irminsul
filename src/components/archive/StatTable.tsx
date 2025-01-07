import StatTableCSS from './stattable.module.css'

export default async function StatTable(props: {table: any[]}) {

    let headers = Object.keys(props.table[0])

    let newTable = props.table
    if (headers.includes('AscensionStatType') && headers.includes('AscensionStatValue')) {
        newTable = props.table.map(stat => {
            let newStat = {...stat}
            delete newStat.substat_type
            newStat[newStat.substat_type] = stat.substat_value
            delete newStat.substat_value
            return newStat
        })
        headers = headers.filter(header => header !== 'AscensionStatType' && header !== 'AscensionStatValue')
    }
    

    return (
        <table>
            <thead>
                <tr>
                    {headers.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {newTable.map((stat, index) => (
                    <tr key={index}>
                        {headers.map((header, cellIndex) => (
                            <td key={cellIndex}>{stat[header]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

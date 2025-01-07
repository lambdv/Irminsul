import StatTableCSS from './stattable.module.css'

export default async function StatTable(props: {
    table: any[]
}) {

    return (
        <table>
            <thead>
            <tr>
                <th>LVL</th>
                <th>BaseHP</th>
                <th>BaseATK</th>
                <th>BaseDEF</th>
                <th>AscensionStatType</th>
                <th>AscensionStatValue</th>
                <th>AscensionPhase</th>
            </tr>
            </thead>
            <tbody>
            {props.table.map((stat, index) => (
                <tr key={index}>
                <td>{stat.LVL}</td>
                <td>{stat.BaseHP}</td>
                <td>{stat.BaseATK}</td>
                <td>{stat.BaseDEF}</td>
                <td>{stat.AscensionStatType}</td>
                <td>{stat.AscensionStatValue}</td>
                <td>{stat.AscensionPhase}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}

import React from 'react';
import { WeaponBaseStat } from '@/types/weapon';
import Table from './Table';

type WeaponStatTableProps = {
    table: WeaponBaseStat[]
}

export default function WeaponStatTable({ table }: WeaponStatTableProps) {
    const headers = ['Level', 'Base ATK'];
    if (table[0].sub_stat_type) {
        headers.push(table[0].sub_stat_type);
    }
    headers.push('Ascension Phase');

    return (
        <Table 
            header={headers.map((header, i) => (
                <th key={i} className="font-bold">{header}</th>
            ))}
            body={table.map((row, index) => (
                <tr key={index}>
                    <td>{row.level}</td>
                    <td>{row.base_atk}</td>
                    {row.sub_stat_type && <td>{row.sub_stat_value}</td>}
                    <td>{row.ascension_phase || 0}</td>
                </tr>
            ))}
        />
    );
} 
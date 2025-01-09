import React from 'react'
import Image from 'next/image'
import TalentCSS from './talent.module.css'
import StatTableCSS from './stattable.module.css'
import StatTable from './BaseStatTable'

type Talent = {
    name: string;
    type: string;
    description: string;
    attributes?: TalentAttribute[];
    properties?: TalentProperty[];
}

type TalentAttribute = {
    hit: string;
    values: number[];
}

type TalentProperty = any;

export default function Talent(props: {data: Talent}) {
  return (
    <div className={TalentCSS.talent}>
        <div id="talent-header">
          <Image src={`/images/talents/${props.data.name}.png`} alt={props.data.name} width={100} height={100} />
          <h2>{props.data.name}</h2>
          <h3>{props.data.type}</h3>
        </div>
        
        <div id="talent-description" className="mb-4" style={{fontFamily: ''}}>
          <p>{props.data.description}</p>
        </div>

        {
          props.data.attributes && <TalentAttributeTable data={props.data} />
        }
    </div>
  )
}


function TalentAttributeTable(props: {data: any}) {
  return         <table className={`${StatTableCSS.stattable} ${TalentCSS.talentTable}`}>
  <thead>
    <tr>
      <th className={StatTableCSS.header}>Hit</th>
        {(() => {
          const maxNumValues = props.data.attributes?.[0]?.values.length;
          return Array.from({length: maxNumValues}, (_, index) => (
            <th key={index} className={StatTableCSS.header}>Lv {index + 1}</th>
          ))
        })()}
    </tr>
  </thead>
  <tbody>
    {props.data.attributes?.map((attribute: TalentAttribute, index: number) => (
      <tr key={index} className={index % 2 === 0 ? StatTableCSS.even : StatTableCSS.odd}>
        <td className={StatTableCSS.label}>{attribute.hit}</td>
        {attribute.values.map((value: number, index: number) => (
          <td key={index} className={StatTableCSS.value}>{value}</td>
        ))}
      </tr>
    ))}
  </tbody>
</table>
}

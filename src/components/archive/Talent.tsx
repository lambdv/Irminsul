import React from 'react'
import Image from 'next/image'
import Table from './Table'
import BaseStatTableCSS from './stattable.module.css'
import TalentCSS from './talent.module.css'
import ExampleIcon from '@public/imgs/icons/bow.png'

import { CharacterTalent, CharacterTalentAttribute } from '@/types/character'

export default function Talent(props: {
  data: CharacterTalent,
  icon?: string
}) {

  return (
    <div className={TalentCSS.talent}>
        <div className={`${TalentCSS.talentHeader}`}>
          {props.icon && <Image 
            src={props.icon} 
              alt={props.data.name} 
              width={100} 
              height={100} 
              className={TalentCSS.talentIcon}
            />}
          <h1>{props.data.type}: {props.data.name}</h1>
        </div>
        
        {props.data.description && <div id="talent-description" className={TalentCSS.talentDescription}>
          <p dangerouslySetInnerHTML={{ __html: props.data.description
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/\n/g, '<br/>') 
          }}/>
        </div>}

        <div className="mb-4 overflow-x-auto">
          {props.data.attributes && 
              <Table
                className={TalentCSS.talentTable}
                header={<>
                  <th>Hit</th>
                  {[...Array(props.data.attributes?.[0]?.values.length)].map((_, index) => (
                    <th key={index}>Lv {index + 1}</th>
                  ))}
                </>}
                body={
                  props.data.attributes?.map((attribute: CharacterTalentAttribute, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? BaseStatTableCSS.even : BaseStatTableCSS.odd}>
                      <td>{attribute.hit}</td>
                      {attribute.values.map((value: number, index: number) => (
                        <td key={index} className="whitespace-normal">{value}</td>
                      ))}
                  </tr>
                ))}
              />
          }
        </div>
    </div>
  )
}
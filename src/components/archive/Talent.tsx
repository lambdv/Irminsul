import React from 'react'
import Image from 'next/image'
import Table from './Table'
import BaseStatTableCSS from './stattable.module.css'
import TalentCSS from './talent.module.css'

import { CharacterTalent, CharacterTalentAttribute } from '@/types/character'

export default function Talent(props: {
  data: CharacterTalent,
  icon?: string
}) {

  return (
    <div className={TalentCSS.talent}>
        <div className={`${TalentCSS.talentHeader}`}>
        
          {props.icon && 
            <Image 
              src={props.icon} 
                alt={props.data.name} 
                width={100} 
                height={100} 
                className={TalentCSS.talentIcon}
                loading="lazy"
                unoptimized={true}
              />
            }
          <h1>{props.data.type}: {props.data.name}</h1>
        </div>
        
        {props.data.description && <div id="talent-description" className={TalentCSS.talentDescription}>
          <p dangerouslySetInnerHTML={{ __html: props.data.description
            .replaceAll(/\*\*(.*?)\*\*\n\%/g, '<b>$1%</b>')
            .replaceAll(/\n/g, '<br />')
            .replaceAll(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            
            .replaceAll(/- (.*?)(?:<br\/>|$)/g, "<li>$1</li>")
            
            .replaceAll(/Normal Attack(s)?/g, '<b class="text-red-500">Normal Attack$1</b>')
            .replaceAll(/Charged Attack(s)?/g, '<b class="text-red-500">Charged Attack$1</b>')
            .replaceAll(/Plunging Attack(s)?/g, '<b class="text-red-500">Plunging Attack$1</b>')
            .replaceAll(/Elemental Skill(s)?/g, '<b class="text-red-500">Elemental Skill$1</b>')
            .replaceAll(/Elemental Burst(s)?/g, '<b class="text-red-500">Elemental Burst$1</b>')


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
"use client"
import Table from "@/components/archive/Table"
import TalentCSS from "@/components/archive/talent.module.css"
// import { CharacterTalentAttribute } from "@/types/character"
import Image from "next/image"
import {useState} from "react"

export default function WeaponPassives({data}: {data: any}){
    const [activeRefinement, setActiveRefinement] = useState(0)

    if(data.refinements.length === 0) return null

    return (
      <div className='w-auto'>
        <div className={TalentCSS.talent}>
            <div className={`${TalentCSS.talentHeader}`}>
                <h1>{data.refinement_name}</h1>
                <div className="flex flex-row mb-2" style={{
                    backgroundColor: '#2a2a2a',
                    borderRadius: '100px',
                    width: 'fit-content',
                    overflow: 'hidden',
                    marginLeft: '10px',
                    marginTop: '5px',
                }}>
                {data.refinements.map((refinement: string, index: number) => (
                    <button className="waves-effect waves-light ripple"
                        style={{
                            backgroundColor: 'transparent',
                            color: activeRefinement === index ? 'var(--ingame-primary-color)' : '#6c6c6c',
                            width: '2rem',
                            height: '2rem',
                            fontSize: '0.7rem',
                            textDecoration: activeRefinement === index ? 'underline' : 'none',
                        }}
                        key={index} 
                        onClick={() => setActiveRefinement(index)}
                    >
                        r{index + 1}
                    </button>
                ))}
            </div>
            </div>

            
            {data.refinements[activeRefinement] && <div id="talent-description" className={TalentCSS.talentDescription}>
            <p dangerouslySetInnerHTML={{ __html: data.refinements[activeRefinement]
                .replaceAll(/\*\*(.*?)\*\*\n\%/g, '<b>$1%</b>')


                //.replaceAll(/\n/g, '. <br />')
                // .replaceAll(/\n/g, '<br />')
                .replaceAll(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                
                .replaceAll(/- (.*?)(?:<br\/>|$)/g, "<li>$1</li>")
                
                .replaceAll(/Normal Attack(s)?/g, '<b class="text-red-500">Normal Attack$1</b>')
                .replaceAll(/Charged Attack(s)?/g, '<b class="text-red-500">Charged Attack$1</b>')
                .replaceAll(/Plunging Attack(s)?/g, '<b class="text-red-500">Plunging Attack$1</b>')
                .replaceAll(/Elemental Skill(s)?/g, '<b class="text-red-500">Elemental Skill$1</b>')
                .replaceAll(/Elemental Burst(s)?/g, '<b class="text-red-500">Elemental Burst$1</b>')
            }}/>
            </div>}

            

        </div>
    </div>
    )
  }
  
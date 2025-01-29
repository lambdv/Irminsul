"use client"

import React from 'react';
import teams from './teams.json'
import Item from '@/components/explore/Item'
import { toKey } from '@/utils/standardizers'

//import search bar store
import {SearchStore} from '@/store/Search'

export default function TeamdpsList() {
const {SearchQuery, setSearchQuery} = SearchStore()

  return (
    <div className="flex flex-row flex-wrap justify-center gap-4"   >
        {teams.data
            .filter(team => team.name.toLowerCase().includes(SearchQuery.toLowerCase()) || team.characters.some(char => char.name.toLowerCase().includes(SearchQuery.toLowerCase())))
            .filter(team => team.name !== "")
            .sort((a, b) => 

                b.characters.reduce((acc, char) => acc + char.dpr, 0) - 
                a.characters.reduce((acc, char) => acc + char.dpr, 0)
            )
            .map((team, teamIndex) => (
                    <div key={teamIndex} className="" style={{
                        width: "390px",
                        height: "auto",
                        backgroundColor: "#1010106e",
                        borderRadius: "5px",
                        padding: "10px 20px",
                        overflow: "hidden",
                        border: "1px solid #232323",
                        // margin: "0 auto",
                        // marginBottom: "10px",
                    }}>
                        <h3 style={{fontWeight: "bold", fontSize: "1rem", marginLeft: "-5px", fontFamily: "", color: "#e2e2e2"}}>{team.name}</h3>
                        <div className="flex flex-row gap-4 justify-center" style={{transform: "scale(0.7)", marginTop: "-20px", marginBottom: "-20px"}}>
                            {team.characters
                                .sort((a, b) => Number(b.dpr) - Number(a.dpr))
                                .map((char, charIndex) => {
                                    const totalDamage = team.characters.reduce((acc, c) => acc + Number(c.dpr), 0);
                                    const teamContribution = Number(char.dpr) / totalDamage;
                                    return (<div key={charIndex}>
                                        <Item
                                            category="character"
                                            src={`/assets/characters/${toKey(char.name)}/avatar.png`}
                                            name={char.name}
                                            rarity={char.rarity}
                                            element={null}
                                            href={`/archive/characters/${toKey(char.name)}`}
                                        />
                                        <p className="text-center text-sm" style={{fontFamily: "", color: "#5e5e5e"}}>{char.specs}</p>
                                        <p className="text-center text-sm" style={{fontFamily: "", color: "#5e5e5e"}}>DPR: {Number(char.dpr).toFixed(0)}</p>
                                        <p className="text-center text-sm" style={{fontFamily: "", color: "#5e5e5e"}}>Ratio: {Math.round(teamContribution * 100)}%</p>
                                    </div>)
                             })}
                        </div>
                        <div className="flex flex-row gap-4 justify-end">
                            
                            <p className="text-sm" style={{fontFamily: "", whiteSpace: "nowrap", color: "#5e5e5e"}}>Total Damage: <span
                                    style={{
                                        fontWeight: "bold",
                                        fontFamily: "ingame",
                                        color: "var(--ingame-primary-color)",
                                    }}
                                >{Number(team.characters.reduce((acc, char) => acc + char.dpr, 0)) < 1000000 ? 
                                (Number(team.characters.reduce((acc, char) => acc + char.dpr, 0)) / 1000).toFixed(2) + 'k' :
                                (Number(team.characters.reduce((acc, char) => acc + char.dpr, 0)) / 1000000).toFixed(2) + ' million'}</span>
                            </p>


                            <p className="text-sm" style={{fontFamily: "", whiteSpace: "nowrap", color: "#5e5e5e"}}>DPS ({team.rotation}s): 
                                <span
                                    style={{
                                        fontWeight: "900px",
                                        fontFamily: "ingame",
                                        color: "var(--ingame-primary-color)",
                                        // backgroundColor: "var(--ingame-primary-color)",
                                        padding: "2px 5px",
                                        borderRadius: "2px",
                                    }}>{(Number(team.characters.reduce((acc, char) => acc + char.dpr, 0)) / team.rotation / 1000).toFixed(2)}k</span>
                            </p>
                        </div>
                    </div>
            ))}
        </div>
  )
}

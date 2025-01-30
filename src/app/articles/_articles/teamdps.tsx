import React from 'react'
import Table from '@/components/archive/Table'
import { Underline } from 'lucide-react'
import RightSidenav from '@/components/navigation/RightSidenav'
import Link from 'next/link'
import Item from '@/components/explore/Item'
import { toKey } from '@/utils/standardizers'
import { getCharacter } from '@/utils/genshinData'
import teams from './teams.json'
import TeamdpsList from './teamdpsList'


// type Team = {
//     name: string
//     rotation: number
//     characters: {name: string, dpr: number, specs?: string}[]
// }

function Body(){
    return <>
        <style>{`
            b{
                color: var(--ingame-primary-color);
            }
        `}</style>

        <p>This article presents a collection of team dps calculations.</p>

        <br />

        <h1 className="text-2xl font-bold mb-2" id="">Teams</h1>
        

        <div style={{
            fontSize: "12px",
            fontWeight: "bold",
            color: "var(--ingame-primary-color)",
            backgroundColor: "var(--ingame-primary-color-light)",
            padding: "10px 10px",
            borderRadius: "4px",
            marginBottom: "16px",
            border: "1px solid var(--ingame-primary-color)",
            width: "100%",
            textWrap: "balance",
        }}>
            <p>Assumptions: <a style={{color: "#b1bdfb", textDecoration: "underline"}} href="https://compendium.keqingmains.com/#what-is-the-kqms">kqmc</a>, 20 fluid subs, 20 fixed subs, 4* characters(c6 9/12/12), 5* characters (c0 9/9/9), r5 4* weapons unless specified otherwise</p>
            <a style={{color: "#b1bdfb", textDecoration: "underline"}} href="https://docs.google.com/spreadsheets/d/e/2PACX-1vS8PwXV03Gyfr2g60gWFoCZrhdvZhvCT0vW9Vf3KvGT62ZbzdZrG4nzJroC0iNqQg/pubhtml?widget=true&amp;headers=false" target="_blank" rel="noopener noreferrer">docs.google.com/spreadsheets/u/2/d/1K8Idip4i-uP9eTuLmWJkZAMBM5u2E3fX</a>
        </div>

                {/** link to google sheet */}
        <TeamdpsList />


        {/* <div className="flex flex-row flex-wrap justify-center gap-4"   >
            {teams.data
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
        </div> */}

    </>
}

const article = {
    title: "Team DPS",
    description: "Collection of team dps calculations.",
    authorUserID: "d4882fcc-8326-4fbb-8b32-d09c0fb86875",
    date: new Date("2025-01-29"),
    slug: "team-dps",
    content: Body(),
    tableOfContents: [],
    gradient: "linear-gradient(45deg, rgba(243, 124, 44, 0.82), rgba(187, 40, 255, 1)), linear-gradient(135deg, rgba(255, 52, 41, 0.903), transparent)",
    thumbnail: "https://64.media.tumblr.com/cf94fc48a2b8707722c74cd246c2594d/9a6524a562ae5d30-b7/s1280x1920/764e57ce9d171c1643fbe4eed75c35e07fdf7af8.jpg",
}
export default article

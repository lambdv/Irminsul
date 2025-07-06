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

        <h1 className="text-2xl font-bold mb-2" id="">Disclaimer</h1>
        <p className="mb-2 text-sm">Damage numbers for each team shown are only 1 metric of team strenth/preformance. Comparing 1 team dps number to another and concluding that one is better than the other is disregarding nuance and other factors.</p>
        <p className="mb-2 text-sm">Numbers and assumptions may not be up to date or 100% accurate and should be taken as estimates with a grain of salt. Numbers should be used as a guideline for team damage output in a vacume with the given assumptions.</p>
        <p className="mb-2 text-sm">Assumptions for each team, (total stats, gearing, rotation, individual hit calculation, erc, ect) and more detailed information can be found in the sheet below.</p>
        <i className="mb-2 text-sm">note that this collection is old, doesn&apos;t include all teams or all characters, and has varying assumptions</i>
        
        <br />
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

        <TeamdpsList />

        <br />
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
}
export default article

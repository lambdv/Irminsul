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
        <h1 className="text-2xl font-bold mb-2" id="">Analysis</h1>
        <section>
            <li>neuvillette is pretty good</li>
            <li>diluc with xianyun is gives a team competitive with other good teams in terms of damage. this is less diluc doing things and more furina and xianyun. hu tao and gaming have similar-ish preforamnce with this team</li>
            <li>100% collison plunge rate with 8 plunges is a optimisitc senario. more realistic team output would be using 50% collision rate and with 6 plunges. where you wait a bit inbetween each plunge to allow for furina hydro app to have time to apply</li>
            <li>morganya is a team theorized before ayaka release and the primary target results gotten against 5 targets are very unrealistic. preformance is a lot closer to the single target result</li>
            <li>the charlotte furina ayaka team is a very good option. it beats her old team premium team in terms of single target damage output on a sheet but may not be a strict upgrade due to ayaka damage being lower which doesn&apos;t play up to her strenths of nuking with all the damage coming from her burst window.</li>
            <li>faruzan c6 gives xiao a hyper carry team on par in-terms of damage against his vv fav teams. this is with our assumptions and will scale better with more investment into xiao, such as a 5* weapon and senarios where focusing your damage output on xiao will preform better than teams with off field damage.</li>
            <li>xiao and wanderer output is similar. preforamnce would come down to the gameplay difference in aoe and rotation lengths. xiao having longer rotations to produce his output but doing more damage in single target/bossing scenarios where collsion plunges are more reliable</li>
            <li>aggrevate gives keqing a viable team. note that c6 fischl is doing a lot of heavy lifting here still</li>
            <li>lisa with ttods is better than sara before c6</li>
            <li>bennett furina teams gives a high damage option for hu tao on par with vv vape while being comfy like double hydro. due to the weird single target healing rotation here reducing bennett uptime and increasing rotation length the dps is lower than vv vape but dpr is simliar.
                you could say it does&apos;t &quot;beat&quot; her vv vape team but it does beat her old double hydro teams
            </li>
            <li>kokomi/mona&apos;s ttds and totm buffs outscale xingqiu damage in ayaka teams</li>

            <li>although international&apos;s teamdps doesn&apos;t sheet well, its damage output is still pretty good and not that far behind the other best options. again the gameplay of international is what makes the team strong</li>
            <li>double hydro hyperbloom team is good. its damage competes with the other best options. remember that it still requires investment. yelan, nahida and c6 xingqiu are not free, em artifacts with a set bonus are not nessecarly significantly cheapter than other carries.
                the damage output being higher than raidens other teams being used to say that the team is better than raidens other teams is also a nessecarly true statement and does ignore a lot of nuance.
            </li>
            <li>2e rotations in vv vape hutao leads to a dps loss on sheet compared to 1e rotations and just running higher er on yelan due to buff uptime on hutao being worse</li>
        </section>

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
    thumbnail: "https://64.media.tumblr.com/cf94fc48a2b8707722c74cd246c2594d/9a6524a562ae5d30-b7/s1280x1920/764e57ce9d171c1643fbe4eed75c35e07fdf7af8.jpg",
}
export default article

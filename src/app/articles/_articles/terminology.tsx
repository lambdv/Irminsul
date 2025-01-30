import React from 'react'
import Table from '@/components/archive/Table'
import { Underline } from 'lucide-react'
import RightSidenav from '@/components/navigation/RightSidenav'
import Link from 'next/link'


const article = {
  title: "Terminology",
  description: "Glossary of fan-made terms and their semantics.",
  authorUserID: "d4882fcc-8326-4fbb-8b32-d09c0fb86875",
  date: new Date("2025-01-22"),
  slug: "terminology",
  content: Body(),
  tableOfContents: [
    { title: "Character Roles", slug: "character-roles" },
  ],
  thumbnail: "https://upload-os-bbs.hoyolab.com/upload/2023/06/13/40172375/4433c3416c51c41fd26a8ae1c6cc0dea_396608951338175362.jpg?x-oss-process=image%2Fresize%2Cs_1000%2Fauto-orient%2C0%2Finterlace%2C1%2Fformat%2Cwebp%2Fquality%2Cq_70",
  gradient: "linear-gradient(45deg, rgba(44, 243, 124, 0.82), rgba(255, 237, 40, 1)), linear-gradient(135deg, rgba(219, 255, 41, 0.903), transparent)",
}

function Body(){
    return <>
        <style>{`
            b{
                color: var(--ingame-primary-color);
            }
        `}</style>

        <p>This article is a list of terms and their definitions.</p>
        <br />
        <h1 className="text-2xl font-bold mb-2" id="character-roles">Character Roles</h1>
        <Table
            style={{
                width: "100%",
                borderCollapse: "collapse",
                borderSpacing: "0px",
                whiteSpace: "wrap",
            }}
            header={<>
                <th>Role</th>
                <th>Description</th>
            </>} 
            body={<>
                <tr>
                    <td style={{whiteSpace: "nowrap"}}>DPS <Tag text="#Deprecated" color="#8119f0"/></td>
                    <td>
                        <div>
                            Acronym for Damage Per Second.
                            <br />
                            <p>When referring as a role, its used to describe a character&apos;s primary role as doing a noticable amount of the team damage contribution.</p>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style={{whiteSpace: "nowrap"}}>Main DPS <Tag text="#Deprecated" color="#8119f0"/></td>
                    <td>
                       <div>
                            <p>Refers to units that primarily deals the most damage <b>and or</b> take the most continuous field time in the team.</p>
                            <br />
                            <p>Due to field time and team damage contribution not being mutually exclusive and the ambiguity between what people&apos;s own definition of the term, it is recommended to use more explicit terms such as &quot;<b>On-Field Damage Dealer</b>&quot; or &quot;<b>Off-Field Damage Dealer</b>&quot;.</p>
                       </div>
                    </td>
                </tr>
                <tr>
                    <td>Sub DPS <Tag text="#Deprecated" color="#8119f0"/></td>
                    <td>
                        <div>
                            <p>&quot;Sub&quot; meaning &quot;lower&quot; or &quot;lesser&quot;.</p>
                            <p>Refers to units that deals a decent amount of the teams damage contribution but less than the main damage dealer or carry. Often doing so off field.</p>
                            <br />
                            <p>Again due to damage contribution and field time not being mutually exclusive and variance in damage contribution depending on other factors, it is recommended to use more explicit terms.</p>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>On-Field Damage Dealer</td>
                    <td>
                        Units who&apos;s major role is to deal damage while on field.
                    </td>
                </tr>
                <tr>
                    <td>Off-Field Damage Dealer</td>
                    <td>
                        Units who&apos;s major role is to deal damage while off field.
                    </td>
                </tr>
                <tr>
                    <td>Support <Tag text="#Deprecated" color="#8119f0"/></td>
                    <td>
                        Very broad term to describe a unit&apos;s that provide supportive utility to the whole team or specific members of the team, such as the damage dealer.
                    </td>
                </tr>
                <tr>
                    <td>Defensive Utility</td>
                    <td>
                        <div>
                            <p>Supportive role that provides some utility to the team that helps with &quot;survivability&quot;.</p>
                            <br />
                            <p>Utility includes but is not limited to healing, shielding, damage reduction, interruption resistance, etc...</p>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>Healer</td>
                    <td>
                        <div>
                            <p>Unit&apos;s who has a major role is that they provides notable healing to the team.</p>
                            <br />
                            <p>Units with self healing in their kit are not considered healers (such as Hu-tao or Fischl c4), as healing implies supportive utility.</p>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>Shielder</td>
                    <td>
                        <div>
                            <p>Unit&apos;s who has a major role is that they provides notable shielding to the team.</p>
                        </div>
                    </td>
                </tr>

                <tr>
                    <td>Buffer</td>
                    <td>
                        <div>
                            <p>Unit&apos;s who has a major role is that they provides damage or stat increases to the team.</p>
                        </div>
                    </td>
                </tr>

                <tr>
                    <td>Elemental Aplication Applier</td>
                    <td>
                        <div>
                            <p>Unit&apos;s who has a major role is that they provides elemental application to enemies that enables some sort of reaction or interaction with other team members.</p>
                            <p>eg: Xingqiu applying hydro to enemies to enable Vaporize reaction for Diluc, Hu Tao, Xiangling, etc.</p>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>Crowd Control (CC)</td>
                    <td>
                        <div>
                            <p>Unit&apos;s provide supportive utility by controlling enemy positioning.</p>
                            <p>Often refered to anemo units that use suction to pull enemies together (Kazuha&apos;s skill, Venti&apos;s burst). This form of CC is specifically called &quot;Grouping&quot;.</p>
                            <p>CC can also come in the form of stopping enemies from moving with the Freeze reaction or Zhongli&apos;s burst.</p>
                            <p>Taunts (Amber and Mona skill) are technically a form of CC, but are not considered due to the inefficiency of the mechanic.</p>
                        </div>
                    </td>
                </tr>




                
            </>}
        />

    </>
}

export default article

function Tag(props: {text: string, color?: string}){
    return <span 
        style={{
            backgroundColor: props.color || "var(--ingame-primary-color)",
            color: "white",
            padding: "0.25rem 0.5rem",
            borderRadius: "10rem",
            fontSize: "0.5rem",
        }}
        >{props.text}
    </span>
}
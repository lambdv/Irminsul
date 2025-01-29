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
                            asd
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style={{whiteSpace: "nowrap"}}>Main DPS <Tag text="#Deprecated" color="#8119f0"/></td>
                    <td>
                       <div>
                            <p>Often refers to units that primarily deals the most damage <b>and or</b> take the most continuous field time in the team.</p>
                            <br />
                            <p>Due to field time and team damage contribution not being mutually exclusive and the ambiguity between what people&apos;s own definition of the term, it is recommended to use more explicit terms such as &quot;<b>On-Field Damage Dealer</b>&quot; or &quot;<b>Off-Field Damage Dealer</b>&quot;.</p>
                       </div>
                    </td>
                </tr>
                <tr>
                    <td>Sub DPS <Tag text="#Deprecated" color="#8119f0"/></td>
                    <td>...</td>
                </tr>
                <tr>
                    <td>On-Field Damage Dealer</td>
                    <td>...</td>
                </tr>
                <tr>
                    <td>Off-Field Damage Dealer</td>
                    <td>...</td>
                </tr>
                <tr>
                    <td>Support</td>
                    <td>...</td>
                </tr>
                <tr>
                    <td>Healer</td>
                    <td>...</td>
                </tr>
                <tr>
                    <td>Shielder</td>
                    <td>...</td>
                </tr>
                <tr>
                    <td>Defensive Utility</td>
                    <td>...</td>
                </tr>
                <tr>
                    <td>Buffer</td>
                    <td>...</td>
                </tr>

                <tr>
                    <td>Elemental Aplication Applier</td>
                    <td>...</td>
                </tr>
                <tr>
                    <td>Shreder</td>
                    <td>...</td>
                </tr>
                <tr>
                    <td>Buffer</td>
                    <td>...</td>
                </tr>
                <tr>
                    <td>Buffer</td>
                    <td>...</td>
                </tr>
                <tr>
                    <td>Buffer</td>
                    <td>...</td>
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
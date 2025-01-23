import React from 'react'
import Table from '@/components/archive/Table'

const article = {
  title: "Terminology",
  description: "",
  authorUserID: "scaf",
  date: "January 22, 2025", 
  slug: "terminology",
  content: Body()
}

function Body(){
    return <>
        <p>This article is a list of terms and their definitions.</p>
        <br />
        <h1 className="text-2xl font-bold">Character Roles</h1>
        <Table 
            style={{
                width: "100%",
                borderCollapse: "collapse",
                borderSpacing: "0px",
            }}
            header={<>
                <th>Role</th>
                <th>Description</th>
            </>} 
            body={
                [
                    {
                        role: "Main DPS",
                        description: "The character that deals the most damage to the enemy."
                    },
                    {
                        role: "Sub DPS",
                        description: "The character that deals damage to the enemy."
                    },
                    {
                        role: "On-Field Damage Dealer",
                        description: "The character that deals damage to the enemy while on the field."
                    },
                    {
                        role: "Off-Field Damage Dealer",
                        description: "The character that deals damage to the enemy while off the field."
                    },
                    {
                        role: "Support",
                        description: "The character that provides support to the team."
                    },
                    {
                        role: "Healer",
                        description: "The character that heals the team."
                    },
                    {
                        role: "Shielder",
                        description: "The character that shields the team."
                    },
                    {
                        role: "Defensive Utility",
                        description: "The character that provides defensive utility to the team."
                    },
                    {
                        role: "Offensive Utility",
                        description: "The character that provides offensive utility to the team."
                    }
                ]
                .map((role) => 
                        <tr key={role.role}>
                            <td>{role.role}</td>
                            <td>{role.description}</td>
                        </tr>
                )
            }
        />

    </>
}

export default article
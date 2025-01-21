"use client"
import { useState, useEffect } from "react"
import { getCharacters, getWeapons, getArtifacts } from "@/utils/genshinData"

export default function Page() {
    const [currentTab, setCurrentTab] = useState("charactersdata")  
    const [characters, setCharacters] = useState([])
    const [weapons, setWeapons] = useState([])
    const [artifacts, setArtifacts] = useState([])
    
    useEffect(() => {
        async function fetchData() {
            const characters = await getCharacters()
            const weapons = await getWeapons()
            const artifacts = await getArtifacts()
            setCharacters(characters)
            setWeapons(weapons)
            setArtifacts(artifacts)
        }
        fetchData()
    }, [])

    function CharacterDataTab(){
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4 text-white">Character Data in DB</h1>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-800 dark:bg-gray-900 shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-700 dark:bg-gray-800">
                            <tr>
                                {
                                    characters[0] ? 
                                        Object.keys(characters[0]).map((key) => (
                                            <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-300 dark:text-gray-200 uppercase tracking-wider">{key}</th>
                                        ))
                                    : null
                                }
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-600 dark:divide-gray-700">
                            {characters.map((character, index) => (
                                <tr key={index} className="hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                                    {
                                        Object.keys(character).map((key) => {
                                            if (key === 'alt') return null;
                                            return (
                                                <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-100 dark:text-gray-300">
                                                    {typeof character[key] === 'object' ? JSON.stringify(character[key]) : character[key]}
                                                </td>
                                            );
                                        })
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
    
    function WeaponDataTab(){
        return (
            <div>
                <h1 className="text-white">Weapon Data</h1>
            </div>
        )
    }
    
    function ArtifactDataTab(){
        return (
            <div>
                <h1 className="text-white">Artifact Data</h1>
            </div>
        )
    }

    return (
        <div className="bg-gray-900">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <div id="tabs" className="flex flex-row gap-4 p-4 bg-gray-800 dark:bg-gray-900 rounded-lg shadow-md">
                <button 
                    onClick={() => setCurrentTab("charactersdata")}
                    className={`px-4 py-2 text-sm font-medium text-gray-300 dark:text-gray-200 bg-gray-700 dark:bg-gray-800 rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color transition-colors ${currentTab === "charactersdata" ? "ring-2 ring-primary-color" : ""}`}
                >
                    Character Data
                </button>
                <button 
                    onClick={() => setCurrentTab("weaponsdata")}
                    className={`px-4 py-2 text-sm font-medium text-gray-300 dark:text-gray-200 bg-gray-700 dark:bg-gray-800 rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color transition-colors ${currentTab === "weaponsdata" ? "ring-2 ring-primary-color" : ""}`}
                >
                    Weapon Data
                </button>
                <button 
                    onClick={() => setCurrentTab("artifactsdata")}
                    className={`px-4 py-2 text-sm font-medium text-gray-300 dark:text-gray-200 bg-gray-700 dark:bg-gray-800 rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color transition-colors ${currentTab === "artifactsdata" ? "ring-2 ring-primary-color" : ""}`}
                >
                    Artifact Data
                </button>
                <button 
                    onClick={() => setCurrentTab("charactersassets")}
                    className={`px-4 py-2 text-sm font-medium text-gray-300 dark:text-gray-200 bg-gray-700 dark:bg-gray-800 rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color transition-colors ${currentTab === "charactersassets" ? "ring-2 ring-primary-color" : ""}`}
                >
                    Character Assets
                </button>
                <button 
                    onClick={() => setCurrentTab("weaponsassets")}
                    className={`px-4 py-2 text-sm font-medium text-gray-300 dark:text-gray-200 bg-gray-700 dark:bg-gray-800 rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color transition-colors ${currentTab === "weaponsassets" ? "ring-2 ring-primary-color" : ""}`}
                >
                    Weapon Assets
                </button>
                <button 
                    onClick={() => setCurrentTab("artifactsassets")}
                    className={`px-4 py-2 text-sm font-medium text-gray-300 dark:text-gray-200 bg-gray-700 dark:bg-gray-800 rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color transition-colors ${currentTab === "artifactsassets" ? "ring-2 ring-primary-color" : ""}`}
                >
                    Artifact Assets
                </button>
            </div>

            <div id="a">
                {currentTab === "charactersdata" && <CharacterDataTab />}
                {currentTab === "weaponsdata" && <WeaponDataTab />}
                {currentTab === "artifactsdata" && <ArtifactDataTab />}
                {currentTab === "charactersassets" && <CharacterDataTab />}
                {currentTab === "weaponsassets" && <WeaponDataTab />}
                {currentTab === "artifactsassets" && <ArtifactDataTab />}
            </div>
        </div>
    )
}

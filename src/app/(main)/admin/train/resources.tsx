import { eq } from "drizzle-orm"
import db from "@root/src/db/db"
import { resources, resources as resourcesTable } from "@root/src/db/schema/resources"
import { embeddings as embeddingsTable } from "@root/src/db/schema/embeddings"
import { deleteResource } from "./actions"
// import { useEffect, useState } from "react"

export default function Resources(props: {resources: any[], embeddings: any[]}) {
    // const [filteredResources, setFilteredResources] = useState<any>(props.resources)

    // useEffect(() => {
    //     setFilteredResources(props.resources)
    // }, [props.resources])

    // const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([])
    // const [selectedSourceFilters, setSelectedSourceFilters] = useState<string[]>([])
    // const [selectedTypeFilters, setSelectedTypeFilters] = useState<string[]>([])
    // const [selectedWeightFilters, setSelectedWeightFilters] = useState<string[]>([])
    // const [selectedDateFilters, setSelectedDateFilters] = useState<string[]>([])
    
    
    

    return (
        <div>
            <div>

            </div>
            {props.resources
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((resource, i) => 
                    <ResourceNode key={resource.id+i} resource={resource} embeddings={props.embeddings.filter(e => e.resourceId === resource.id)} />
                )}
        </div>
    )
}

function ResourceNode(props: {resource: any, embeddings: any[]}) {
    return (
        <details  className=" bg-[#1d1d1d] rounded-lg m-1">
            <summary className="cursor-pointer p-4 flex justify-between">
                {props.resource.content.slice(0, 50)}...
                <p> </p>
                <div className="flex flex-row gap-2">
                    {props.resource.tags[0] !== "" && props.resource.tags.map((tag: string, i) => (
                        <span key={i} className="bg-[#2d2d2d] rounded-md px-2 py-1 text-sm">
                            {tag}
                        </span>
                    ))}
                    <p className="bg-[#2d2d2d] rounded-md px-2 py-1 text-sm">
                        {props.resource.source.replace(/^https?:\/\//, '').split('/')[0]}
                    </p>
                    <p className="bg-[#2d2d2d] rounded-md px-2 py-1 text-sm">
                        {props.resource.type}
                    </p>
                    <p className="bg-[#2d2d2d] rounded-md px-2 py-1 text-sm">
                        {props.resource.weight}
                    </p>
                    <p className="bg-[#2d2d2d] rounded-md px-2 py-1 text-sm">
                        {props.resource.date.toISOString().split('T')[0]}
                    </p>
                    <p className="bg-[#2d2d2d] rounded-md px-2 py-1 text-sm">
                        {JSON.stringify(props.embeddings.length)}
                    </p>
                </div>
 
            </summary>
            <div className="mt-2 p-2 bg-[#1d1d1d] rounded">
                <pre className="whitespace-pre-wrap" style={{
                    width: "100%",
                    backgroundColor: "#1d1d1d",
                    color: "#dcdcdc",
                    border: "1px solid #303030",
                    borderRadius: "10px",
                    padding: "10px",
                    fontFamily: "monospace",
                    position: "relative",
                    overflow: "auto",
                }}>
                    <ObjectTable key={`resource-${props.resource.id}`} obj={props.resource} />
                    <br /> 
                    {props.embeddings.map((embedding) => (
                        <ObjectTable key={`embedding-${embedding.id}`} obj={embedding} />
                    ))}
                </pre>


                <form action={async (fd) => {
                    "use server"
                    deleteResource(props.resource.id)
                }}>
                    <button type="submit"
                        name="resourceId"
                        value={props.resource.id}
                        style={{
                            backgroundColor: "#000000",
                            color: "#dcdcdc",
                            borderRadius: "5px",
                            padding: "10px",
                            fontFamily: "monospace",
                            marginLeft: "auto",
                            marginRight: "10px",
                            textAlign: "right",
                            display: "block",
                        }}

                    >Delete</button>
                </form> 
            </div>
        </details>
    )
}


function ObjectTable(props: {obj: any}){
    return (
        <div className="flex flex-row gap-2" style={{width:"100%"}}>
            {Object.keys(props.obj).map((key, i) => {
                return (
                    <div key={`${key}-${i}`} className="flex flex-row gap-2" style={{
                        backgroundColor: "#1d1d1d",
                        color: "#dcdcdc",
                        border: "1px solid #303030",
                        borderRadius: "10px",
                        padding: "10px",
                        fontFamily: "monospace",
                        outline: "none",
                    }}>
                {key}: {JSON.stringify(props.obj[key])}
            </div>
        )
    })}
        </div>
    )
}
"use client"
import { eq } from "drizzle-orm"
import db from "@root/src/db/db"
import { resources as resourcesTable } from "@root/src/db/schema/resources"
import { embeddings as embeddingsTable } from "@root/src/db/schema/embeddings"
import { deleteResource } from "./actions"

export default function Resources(props: {resources: any[], embeddings: any[]}) {
    return (
        <div>
            <div>

            </div> 
            {props.resources
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .map((resource) => 
                <ResourceNode key={resource.id} resource={resource} embeddings={props.embeddings} />
            )}

        </div>
    )
}

function ResourceNode(props: {resource: any, embeddings: any[]}) {
    return (
        <details key={props.resource.id} className=" bg-[#1d1d1d] rounded-lg m-1">
            <summary className="cursor-pointer p-4 flex justify-between">
                {props.resource.content.slice(0, 50)}...
                <p> </p>
                <div className="flex flex-row gap-2">
                    {props.resource.tags[0] !== "" && props.resource.tags.map((tag: string) => (
                        <span key={tag} className="bg-[#2d2d2d] rounded-md px-2 py-1 text-sm">
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
            <div className="mt-2 p-2 bg-[#2d2d2d] rounded">
                <pre className="whitespace-pre-wrap">
                    {JSON.stringify(props.resource, null, 2)}
                    <br />
                    {JSON.stringify(props.embeddings)}
                </pre>


                <form action={deleteResource.bind(null, props.resource.id)}>
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

                        onClick={() => {
                            deleteResource(props.resource.id)
                            ///reload page
                            window.location.reload()
                        }}
                    >Delete</button>
                </form> 
            </div>
        </details>
    )
}


// function OldResources(props: {resources: any[], embeddings: any[]}) {
//     const { resources, embeddings } = props
//     return (
//             <table>
//                 <thead>
//                     <tr>
//                         <th style={{
//                                 backgroundColor: "#1d1d1d",
//                                 color: "#dcdcdc",
//                                 border: "1px solid #303030",
//                                 borderRadius: "10px",
//                                 padding: "10px",
//                                 fontFamily: "monospace",
//                                 outline: "none",
//                             }}
//                         >Resources</th>

//                         <th style={{
//                                 backgroundColor: "#1d1d1d",
//                                 color: "#dcdcdc",
//                                 border: "1px solid #303030",
//                                 borderRadius: "10px",
//                                 padding: "10px",
//                                 fontFamily: "monospace",
//                                 outline: "none",
//                             }}
//                         >source</th>
                        

//                         <th style={{
//                                 backgroundColor: "#1d1d1d",
//                                 color: "#dcdcdc",
//                                 border: "1px solid #303030",
//                                 borderRadius: "10px",
//                                 padding: "10px",
//                                 fontFamily: "monospace",
//                                 outline: "none",
//                             }}
//                         >type</th>

//                         <th style={{
//                                 backgroundColor: "#1d1d1d",
//                                 color: "#dcdcdc",
//                                 border: "1px solid #303030",
//                                 borderRadius: "10px",
//                                 padding: "10px",
//                                 fontFamily: "monospace",
//                                 outline: "none",
//                             }}
//                         >date</th>

//                         <th style={{
//                                 backgroundColor: "#1d1d1d",
//                                 color: "#dcdcdc",
//                                 border: "1px solid #303030",
//                                 borderRadius: "10px",
//                                 padding: "10px",
//                                 fontFamily: "monospace",
//                                 outline: "none",
//                             }}
//                         >weight</th>

//                         <th style={{
//                                 backgroundColor: "#1d1d1d",
//                                 color: "#dcdcdc",
//                                 border: "1px solid #303030",
//                                 borderRadius: "10px",
//                                 padding: "10px",
//                                 fontFamily: "monospace",
//                                 outline: "none",
//                             }}
//                         >tags</th>

//                         <th
//                             style={{
//                                 backgroundColor: "#1d1d1d",
//                                 color: "#dcdcdc",
//                                 border: "1px solid #303030",
//                                 borderRadius: "10px",
//                                 padding: "10px",
//                                 fontFamily: "monospace",
//                                 outline: "none",
//                                 width: "1%",
//                             }}
//                         >Embeddings</th>
//                         <th
//                             style={{
//                                 backgroundColor: "#1d1d1d",
//                                 color: "#dcdcdc",
//                                 border: "1px solid #303030",
//                                 borderRadius: "10px",
//                                 padding: "10px",
//                                 fontFamily: "monospace",
//                                 outline: "none",
//                                 width: "1%",
//                             }}
//                         >Options</th>
//                     </tr>
//                 </thead>

//                 <tbody>
//                     {resources.map((resource) => (
//                         <tr key={resource.id}>
//                             <td style={{
//                                 backgroundColor: "#1d1d1d",
//                                 color: "#dcdcdc",
//                                 border: "1px solid #303030",
//                                 borderRadius: "10px",
//                                 padding: "10px",
//                                 fontFamily: "monospace",
//                                 outline: "none",
//                                 maxWidth: "80%",
//                             }}>
//                                 {
//                                     resource.content.length > 100 ? resource.content.slice(0, 100) + "..." : resource.content
//                                 }
//                             </td>

//                             <td style={{
//                                         backgroundColor: "#1d1d1d",
//                                         color: "#dcdcdc",
//                                         border: "1px solid #303030",
//                                         borderRadius: "10px",
//                                         padding: "10px",
//                                         fontFamily: "monospace",
//                                         outline: "none",
//                                         width: "1%",
//                                     }}>{resource.source}</td>
//                             <td style={{
//                                         backgroundColor: "#1d1d1d",
//                                         color: "#dcdcdc",
//                                         border: "1px solid #303030",
//                                         borderRadius: "10px",
//                                         padding: "10px",
//                                         fontFamily: "monospace",
//                                         outline: "none",
//                                         width: "1%",
//                                     }}>{resource.type}</td>
//                             <td style={{
//                                         backgroundColor: "#1d1d1d",
//                                         color: "#dcdcdc",
//                                         border: "1px solid #303030",
//                                         borderRadius: "10px",
//                                         padding: "10px",
//                                         fontFamily: "monospace",
//                                         outline: "none",
//                                         width: "1%",
//                                     }}>{resource.date.toISOString().split('T')[0]}</td>
//                             <td style={{
//                                         backgroundColor: "#1d1d1d",
//                                         color: "#dcdcdc",
//                                         border: "1px solid #303030",
//                                         borderRadius: "10px",
//                                         padding: "10px",
//                                         fontFamily: "monospace",
//                                         outline: "none",
//                                         width: "1%",
//                                     }}>{resource.weight}</td>
//                             <td style={{
//                                         backgroundColor: "#1d1d1d",
//                                         color: "#dcdcdc",
//                                         border: "1px solid #303030",
//                                         borderRadius: "10px",
//                                         padding: "10px",
//                                         fontFamily: "monospace",
//                                         outline: "none",
//                                         width: "1%",
//                                     }}>{resource.tags.join(', ')}</td>
//                             <td
//                                 style={{
//                                     backgroundColor: "#1d1d1d",
//                                     color: "#dcdcdc",
//                                     border: "1px solid #303030",
//                                     borderRadius: "10px",
//                                     padding: "10px",
//                                     fontFamily: "monospace",
//                                     outline: "none",
//                                     maxWidth: "10%",
//                                     whiteSpace: "wrap",
//                                     overflow: "hidden",
//                                     textOverflow: "ellipsis",
//                                 }}
//                             >
//                             {embeddings.find((embedding) => embedding.resourceId === resource.id)?.embedding.slice(0, 1)}...</td>
//                                 <td
//                                     style={{
//                                         backgroundColor: "#1d1d1d",
//                                         color: "#dcdcdc",
//                                         border: "1px solid #303030",
//                                         borderRadius: "10px",
//                                         padding: "10px",
//                                         fontFamily: "monospace",
//                                         outline: "none",
//                                         width: "1%",
//                                     }}
//                             >
//                                 <form action={async (formData) => {
//                                     "use server"
//                                     const resourceId = formData.get('resourceId') as string
//                                     await db.delete(resourcesTable).where(eq(resourcesTable.id, resourceId))
//                                     await db.delete(embeddingsTable).where(eq(embeddingsTable.resourceId, resourceId))
//                                     console.log("Deleted resource and embedding")
//                                     revalidatePath('/train')
//                                 }}>
//                                     <button type="submit"
//                                         name="resourceId"
//                                         value={resource.id}
//                                         style={{
//                                             backgroundColor: "#1d1d1d",
//                                             color: "#dcdcdc",
//                                             border: "1px solid #303030",
//                                             borderRadius: "10px",
//                                             padding: "10px",
//                                             fontFamily: "monospace",
//                                             outline: "none",
//                                         }}
//                                     >Delete</button>
//                                 </form>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//     )
// }

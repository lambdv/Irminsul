import { isAdmin } from "../auth"
import { redirect } from "next/navigation"
export default async function Page(){
    if(!await isAdmin())
        redirect("/")

    return <div>Welcome player 001</div>
}
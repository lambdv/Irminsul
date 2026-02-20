import React from "react"
import { getServerUser } from "@/lib/server-session"
import SupportPage from "./SupportPage"

export async function generateMetadata() {
  return {
    title: "Pricing | Irminsul",
  }
}

export default async function page() {
  const user = await getServerUser()

  return <SupportPage user={user} />
}

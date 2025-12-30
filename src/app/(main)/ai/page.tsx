import React from "react"
import Chat from "@/feature/ai/components/chat"
import styles from "@/feature/ai/components/seelie.module.css"

import RightSidenav from "@/components/navigation/RightSidenav"
import Advertisment from "@/components/ui/Advertisment"
import { getServerUser } from "@/lib/server-session"
import { getCDNURL } from "@/utils/getAssetURL"

export async function generateMetadata() {
  return {
    title: "Seelie | Irminsul",
    description: "Seelie is your AI guide for Genshin Impact.",
    image: getCDNURL("/imgs/icons/seelie.png"),
    url: "/seelie",
  }
}

export default async function Page() {
  const user = await getServerUser()

  return (
    <div className={styles.seelieBackground}>
      <Chat user={user} />
    </div>
  )
}

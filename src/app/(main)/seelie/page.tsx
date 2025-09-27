import React from 'react'
import Chat from './chat';
import styles from './seelie.module.css'

import RightSidenav from '@/components/navigation/RightSidenav';
import Advertisment from '@/components/ui/Advertisment';
import { getServerUser } from '@/lib/server-session'
import { getCDNURL } from '@/utils/getAssetURL';

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
      {/* <RightSidenav>
        <Advertisment type="card" />
      </RightSidenav> */}
      <Chat
        user={user}
      />
    </div>
  )
}

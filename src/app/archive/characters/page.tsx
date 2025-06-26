import React, { Suspense } from 'react' 
import CharacterItemList from './CharacterItemList'
import ItemsContainer from '@/components/explore/ItemsContainer'
import BrowseHeader from '@/components/explore/BrowseHeader'
import { getCDNURL } from '@/utils/getAssetURL'
import {CharacterFilterStore} from '@/store/CharacterFilters'
import {getCharacters} from '@/utils/genshinData'
import Loading from '../loading'
import Advertisment from '@/components/ui/Advertisment'
import RightSidenav from '@/components/navigation/RightSidenav'

const CHARACTER_ICON = getCDNURL("imgs/icons/characterIcon.png")

export const metadata = {
  title: "Characters | Irminsul",
}

export default async function Characters({searchParams}) {
  const characters = await getCharacters()
  return (
    <Suspense fallback={<Loading/>}>
      <div id="characters-page">
        <BrowseHeader
          icon={CHARACTER_ICON}
          title="Characters"
          store={CharacterFilterStore}
        />  
        <RightSidenav>
          <br />
          <Advertisment type="card"/>
        </RightSidenav>
        <CharacterItemList 
          data={characters}
        />

        {/* <ItemsContainer
          data={characters}
          store={CharacterFilterStore}
          type="character"
        /> */}
      </div>  
      <Advertisment type="card"/>
    </Suspense>
  )
}

  
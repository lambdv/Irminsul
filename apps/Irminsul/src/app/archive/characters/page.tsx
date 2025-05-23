import React, { Suspense } from 'react' 
import CharacterItemList from './CharacterItemList'
import ItemsContainer from '@/components/explore/ItemsContainer'
import BrowseHeader from '@/components/explore/BrowseHeader'
import characterIcon from '@public/imgs/icons/characterIcon.png'
import {CharacterFilterStore} from '@/store/CharacterFilters'
import {getCharacters} from '@/utils/genshinData'
import Loading from '../loading'
import Advertisment from '@/components/ui/Advertisment'
import RightSidenav from '@/components/navigation/RightSidenav'

export const metadata = {
  title: "Characters | Irminsul",
}

export default async function Characters({searchParams}) {
  const characters = await getCharacters()
  return (
    <Suspense fallback={<Loading/>}>
      <div id="characters-page">
        <BrowseHeader
          icon={characterIcon}
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

  
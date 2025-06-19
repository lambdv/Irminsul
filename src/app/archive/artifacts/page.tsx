import React from 'react' 
import ArtifactItemList from './ArtifactItemList'
import BrowseHeader from '@/components/explore/BrowseHeader'
import artifactIcon from '@public/imgs/icons/artifactIcon.png'
import {ArtifactFilterStore} from '@/store/ArtifactFilters'
import {getArtifacts} from '@/utils/genshinData'
import RightSidenav from '@/components/navigation/RightSidenav'
import Advertisment from '@/components/ui/Advertisment'

export const metadata = {
  title: "Artifacts | Irminsul",
}

export default async function Artifacts({searchParams}) {
  const artifacts = await getArtifacts()
  return (
    <div id="artifacts-page">
      <BrowseHeader
        icon={artifactIcon}
        title="Artifacts"
        store={ArtifactFilterStore}
      />
      <RightSidenav>
        <br />
        <Advertisment type="card"/>
      </RightSidenav>
      <ArtifactItemList data={artifacts}/>
      <Advertisment type="card"/>
    </div>
  )
}
  
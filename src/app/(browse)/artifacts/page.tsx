import React from 'react' 
import ArtifactItemList from '@/app/(browse)/artifacts/ArtifactItemList'
import BrowseHeader from '@/components/explore/BrowseHeader'
import artifactIcon from '@public/assets/icons/artifactIcon.png'
import {ArtifactFilterStore} from '@/store/ArtifactFilters'
import {getArtifacts} from '@/utils/DataGetters'

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
      <ArtifactItemList data={artifacts}/>
    </div>
  )
}
  
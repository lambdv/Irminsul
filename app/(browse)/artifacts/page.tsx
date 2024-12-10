import React from 'react'; 
import ArtifactItemList from '@/components/explore/ArtifactItemList';
import BrowseHeader from '@/components/explore/BrowseHeader';
import artifactIcon from '@/public/assets/icons/artifactIcon.png'
import {ArtifactFilterStore} from '@/store/ArtifactFilters'

export const metadata = {
  title: "Artifacts | Irminsul",
};

/**
 * Function that fetches all characters from the genshin API
 * @returns 
 */
async function getArtifacts(){
  const res = await fetch('https://genshin.jmp.blue/artifacts', {
      next: {
          revalidate: 60 * 60 * 24 * 7 // weekly
      }
  })
  const artifacts = await res.json()
  const artifactDataPromises = artifacts.map(async (artifact) => {
    const artifactData = await fetch(`https://genshin.jmp.blue/artifacts/${artifact}`, {
        next: {
            revalidate: 60 * 60 * 24 * 7 // weekly
        }
    })
    return artifactData.json();
  });
  const artifactDataList = await Promise.all(artifactDataPromises);
  return artifactDataList;
}


export default async function Artifacts({searchParams}) {
  const artifacts = await getArtifacts();

  return (
    <div id="artifacts-page">
      <BrowseHeader
        icon={artifactIcon}
        title="Artifacts"
        store={ArtifactFilterStore}
        page="artifact"
      />
      <ArtifactItemList 
        data={artifacts}
      />
    </div>
  );
}
  
import { getArtifact, getArtifacts } from '@/utils/DataGetters';
import { toTitleCase } from '@/utils/standardizers';
import { Suspense } from 'react';

//page metadata
export async function generateMetadata({params}) {
  const {id} = await params
  const name = toTitleCase(id)
  return {
    title: `${name} | Irminsul`,
    description: "",
    image: `/assets/artifacts/${id}/flower.png`,
    url: `/artifacts/${id}`,
  }
}

//statically generate all character pages from api at build time
export async function generateStaticParams() {
  const artifacts = await getArtifacts()
  return artifacts.map((artifact) => ({
    id: artifact.id,
    data: artifact
  }))
}


export default async function ArtifactPage({params}) {
  const {id} = await params
  const data = params.data ? params.data : await getArtifact(id)
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div id="">
        {id}
        {JSON.stringify(data)}
      </div>
    </Suspense>
  );
}

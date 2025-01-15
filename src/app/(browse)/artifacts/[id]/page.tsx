import Header from '@/components/archive/Header'
import { getArtifact, getArtifacts } from '@/utils/DataGetters'
import { toTitleCase } from '@/utils/standardizers'
import { Suspense } from 'react'
import ArchivePageCSS from "@/components/archive/archivePage.module.css"

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
// export async function generateStaticParams() {
//   const artifacts = await getArtifacts();
//   return artifacts.map((artifact) => ({
//     id: artifact.id,
//     data: artifact
//   }));
// }

export default async function ArtifactPage({params}) {
  const {id} = await params
  const data = params.data ? params.data : await getArtifact(id)
  return (
      <div id={ArchivePageCSS.archiveRecordContentContainer}>
        <Header 
          title={data.name} 
          splashImage={`/assets/artifacts/${data.key}/${data.key}_flower.png`}
          imageWidth={"100%"}
          imageHeight={"100%"}
        >
          <div>
            {Array.from({length: data.rarity_max}).map((_, index) => (
              <i key={index} className="material-symbols-rounded"
                style={{
                  color: '#FFD700',
                }}
              >star</i>
            ))}
            <p>{data.flower_description}</p>
          </div>
        </Header>

        <div id="pagecontent" className={ArchivePageCSS.archiveRecordContentContainer}>
          <div className="bg-zinc-900 p-4 rounded-md shadow-md">
            <h2 className="text-lg font-semibold text-gray-100">Set Bonus</h2>
            <div className="text-gray-400 flex"><b className="mr-2" style={{whiteSpace: 'nowrap'}}>2-Piece Set:</b> <span className="font-medium text-gray-200 font-mono">{data.two_pc_bonus}</span></div>
            <div className="text-gray-400 flex"><b className="mr-2" style={{whiteSpace: 'nowrap'}}>4-Piece Set:</b> <span className="font-medium text-gray-200 font-mono">{data.four_pc_bonus}</span></div>
          </div>
        </div>
      </div>
  )
}

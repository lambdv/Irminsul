import Header from '@/components/archive/Header'
import { getArtifact, getArtifacts } from '@/utils/genshinData'
import { toTitleCase } from '@/utils/standardizers'
import { Suspense } from 'react'
import ArchivePageCSS from "@/components/archive/archivePage.module.css"
import CommentSection from "@/components/ui/CommentSection"
import { getAssetURL } from '@/utils/getAssetURL'
import RightSidenav from '@/components/navigation/RightSidenav'
import Advertisment from '@/components/ui/Advertisment'
import Loading from '@/app/loading'

//page metadata
export async function generateMetadata({params}) {
  const {id} = await params
  const data = await getArtifact(id)
  return {
    title: `${data.name} | Irminsul`,
    description: data.flower_description,
    image: `/assets/artifacts/${data.key}/${data.key}_flower.png`,
    url: `/artifacts/${id}`,
  }
}

//statically generate all character pages from api at build time
export async function generateStaticParams() {
  const artifacts = await getArtifacts();
  return artifacts.map((artifact) => ({
    id: artifact.id,
    data: artifact
  }))
}

export default async function ArtifactPage({params}) {
  const {id} = await params
  const data = params.data ? params.data : await getArtifact(id)
  return (
      <Suspense fallback={<Loading />}>
        <ArtifactHeader data={data} />
        <RightSidenav>
          <br />
          <Advertisment type="card"/>
        </RightSidenav>

        <div id="pagecontent" className={ArchivePageCSS.archiveRecordContentContainer}>
          <ArtifactSetBonus data={data} />
          <br/>
          <CommentSection pageID={data.key}/>
        </div>     
        <Advertisment type="card"/>
      </Suspense>
  )
}

async function ArtifactHeader({data}){
  return (
    <Header 
      title={data.name} 
      splashImage={getAssetURL("artifact", data.name, "flower.png")}
      imageStyle={{
        width: "100%",
        height: "auto",
        objectFit: "contain",
        left: "-20px",
      }}
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
  )
}

async function ArtifactSetBonus({data}){
  if(!data.two_pc_bonus && !data.four_pc_bonus) 
    return <></>
  return (
    <div className="p-4 rounded-md" style={{backgroundColor: 'var(--light-elevated-color)'}}>
      <h2 className="text-lg font-semibold" style={{fontSize: '1.2rem', marginBottom: '0.5rem'}}>Set Bonus</h2>
      {data.two_pc_bonus !== "" && <div className="text-gray-400 flex" style={{paddingBottom: '0.5rem'}}><b className="mr-2" style={{whiteSpace: 'nowrap'}}>2-Piece Set:</b> <span className="font-medium">{data.two_pc_bonus}</span></div>}
      {data.four_pc_bonus !== "" && <div className="text-gray-400 flex" style={{paddingBottom: '0.5rem'}}><b className="mr-2" style={{whiteSpace: 'nowrap'}}>4-Piece Set:</b> <span className="font-medium">{data.four_pc_bonus}</span></div>}
  </div>
  )
}


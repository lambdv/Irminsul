import Header from '@/components/archive/Header'
import Table from '@/components/archive/Table'
import BaseStatTable from '@/components/archive/BaseStatTable'
import { getWeapon, getWeapons } from '@/utils/genshinData'
import { toTitleCase } from '@/utils/standardizers'
import Talent from '@/components/archive/Talent'
import { Suspense } from 'react'
import ArchivePageCSS from "@/components/archive/archivePage.module.css"
import CommentSection from "@/components/ui/CommentSection"


//page metadata
export async function generateMetadata({params}) {
  const {id} = await params
  const data = await getWeapon(id)
  return {
    title: `${data.name} | Irminsul`,
    description: data.description,
    image: `/assets/weapons/${data.key}/${data.key}_splash_art.png`,
    url: `/weapons/${id}`,
  }
}

//statically generate all character pages from api at build time
// export async function generateStaticParams() {
//   const weapons = await getWeapons()
//   return weapons.map((weapon) => ({
//     id: weapon.id,
//     data: weapon
//   }))
// }

export default async function WeaponPage({params}) {
  const {id} = await params
  const data = params.data ? params.data : await getWeapon(id)

  return (
    <div id="">
      <Header 
        title={data.name}
        splashImage={`/assets/weapons/${data.key}/${data.key}_splash_art.png`}
      >
        <>
          <section className={ArchivePageCSS.archiveRecordSection}>
            {Array.from({length: data.rarity}).map((_, index) => (
              <i key={index} className="material-symbols-rounded"
                style={{
                  color: '#FFD700',
                }}
              >star</i>
            ))}
            <p>{data.description}</p>
          </section>
        </>
      </Header>
      
      <div className={ArchivePageCSS.archiveRecordContentContainer}>
          <div className="flex flex-col md:flex-row">
            <div className="mr-3 mb-3">
              <BaseStatTable 
                table={data.base_stats.map(stat => ({
                  lvl: stat.level,
                  base_atk: stat.base_atk,
                  AscensionStatValue: stat.sub_stat_value,
                  AscensionStatType: stat.sub_stat_type,
                  ascention: stat.ascension_phase,
                }))} 
                cost={[]}
              />
            </div>
            <div>
                <Talent
                  data = {{
                    type: "Passive",
                    name: data.refinement_name,
                    description: data.refinements[0],
                  }}
                />
            </div>
          </div>
          <br/>
          <CommentSection pageID={data.key}/>
      </div>
    </div>
  )
}
  
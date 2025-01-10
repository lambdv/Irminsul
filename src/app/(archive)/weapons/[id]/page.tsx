"use server"
import Header from '@/components/archive/Header'
import Table from '@/components/archive/Table'
import BaseStatTable from '@/components/archive/BaseStatTable'
import { getWeapon, getWeapons } from '@/utils/DataGetters'
import { toTitleCase } from '@/utils/standardizers'
import Talent from '@/components/archive/Talent'
import { Suspense } from 'react'

//page metadata
export async function generateMetadata({params}) {
  const {id} = await params
  const name = toTitleCase(id)
  return {
    title: `${name} | Irminsul`,
    description: "",
    image: `/assets/weapons/${id}/splash.png`,
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
    <Suspense fallback={<div>Loading...</div>}>
    <div id="">
      <Header 
        title={data.name}
        splashImage={`/assets/weapons/${data.key}/${data.key}_splash_art.png`}
      >
        <>
          <div>
            {Array.from({length: data.rarity}).map((_, index) => (
              <i key={index} className="material-symbols-rounded"
                style={{
                  color: '#FFD700',
                }}
              >star</i>
            ))}
            <p>{data.description}</p>
          </div>
        </>
      </Header>
      
      <div style={{paddingLeft: '50px', paddingRight: '50px'}}>
          <br/>
          <div className="flex">
            <div className="mr-10">
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
                  icon={true}
                />
            </div>
          </div>

      </div>
    </div>
    </Suspense>
  )
}
  
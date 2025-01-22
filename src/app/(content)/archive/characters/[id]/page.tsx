import RightSidenav from "@/components/navigation/RightSidenav"
import { getCharacter, getCharacters } from "@/utils/genshinData"
import { toTitleCase } from "@/utils/standardizers"
import Image from 'next/image'
import Header from "@/components/archive/Header"
import { Character } from "@/types/character"
import BaseStatTable from "@/components/archive/BaseStatTable"
import Talent from "@/components/archive/Talent"
import { Suspense } from "react"
import ArchivePageCSS from "@/components/archive/archivePage.module.css"
import { unstable_cache, unstable_cacheLife } from "next/cache"
import CommentSection from "@/components/ui/CommentSection"
import { getMainColor } from "@/utils/getMainColor"
import TalentCSS from '@/components/archive/talent.module.css'
import { getAssetURL } from '@/utils/getAssetURL'

//page metadata
export async function generateMetadata({params}) {
  const {id} = await params
  const data = await getCharacter(id)
  if(data === undefined || data === null) return {}
  return {
    title: `${data.name} | Irminsul`,
    description: data.description,
    image: getAssetURL("character", data.name, "splash.png"),
    url: `/characters/${id}`,
  }
}

// statically generate all character pages from api at build
// export async function generateStaticParams() {
//   const characters = await getCharacters()
//   return characters.map((character) => ({
//     id: character.key,
//     data: character
//   }))
// }

export default async function CharacterPage({params}) {
  // "use cache"
  // unstable_cacheLife({stale: 300, revalidate: 2592000, expire: undefined})
  const {id} = await params
  const data = params.data ? params.data : await getCharacter(id)

  if(data === undefined || data === null) 
    return <div>Character data not found</div>

  const color = await getMainColor(getAssetURL("character", data.name, "splash.png"))

  return (
      <Suspense fallback={<div>Loading...</div>}>
        <CharacterHeader data={data}/>
        <TableOfContents/>
        <div id="pagecontent" className={ArchivePageCSS.archiveRecordContentContainer}>
          <br/>
          <CharacterBaseStats data={data}/>
          <CharacterTalents data={data}/>
          <CharacterPassives data={data}/>
          <CharacterConstellations data={data}/>
          <br/>
          <Suspense fallback={<div>Loading...</div>}> 
            <CommentSection pageID={data.key} color={color} />
          </Suspense>
        </div>
      </Suspense>
  )
}

function CharacterHeader({data}){
  return (
    <Header 
      title={data.name}
      splashImage={getAssetURL("character", data.name, "splash.png")}
      bgImage={getAssetURL("character", data.name, "namecard.png")}
    >
      <div>
        {Array.from({length: data.rarity}).map((_, index) => (
          <i key={index} className="material-symbols-rounded" style={{color: '#FFD700'}}>star</i>
        ))}
      </div>
      <p>{data.description}</p>
    </Header>
  )
}

function TableOfContents(){
  return (
    <RightSidenav>
      <ul>
        <li><a href="#basestats">Base Stats</a></li>
        <li><a href="#talents">Talents</a></li>
        <li><a href="#passives">Passives</a></li>
        <li><a href="#constellations">Constellations</a></li>
      </ul>
    </RightSidenav>
  )
}

function CharacterBaseStats({data}){
  return (
    <section id="basestats" className={ArchivePageCSS.archiveRecordSection}>
      <h2 className="mb-2 text-2xl font-bold">Base Stats</h2>
        <div className="mb-4 overflow-x-auto">
          <BaseStatTable 
            table={data.base_stats}
            cost={data.ascension_costs}
          />        
        </div>
    </section>
  )
}

function CharacterTalents({data}){
  return (
    <section id="talents" className={ArchivePageCSS.archiveRecordSection}>
      <h2 className="mb-2 text-2xl font-bold">Talents</h2>
      {data.talents.map((talent, index) => {
          let icon = ""
          switch(talent.type) {
            case "Normal Attack":
              icon = `/imgs/icons/${data.weapon}.png`
              break
            case "Elemental Skill":
              icon = getAssetURL("character", data.name, "skill.png")
              break
            case "Elemental Burst":
              icon = getAssetURL("character", data.name, "burst.png")
              break
          }
          return <Talent 
            key={index}
            data={talent}
            icon={icon}
          />
      })}
    </section>
  )
}

function CharacterPassives({data}){
  return (
    <section id="passives" className={ArchivePageCSS.archiveRecordSection}>
      <h2 className="mb-2 text-2xl font-bold">Passives</h2>
      {data.passives.map((passive, index) => {
        let icon = ""
        switch(passive.type) {
          case "1st Ascension Passive":
            icon = getAssetURL("character", data.name, "a1.png")
            break
          case "4th Ascension Passive":
            icon = getAssetURL("character", data.name, "a4.png")
            break
          case "Utility Passive":
            icon = getAssetURL("character", data.name, "passive.png")
            break
        }
        return <Talent 
          key={index}
          data={passive}
          icon={icon}
        />
      })}
    </section>
  )
}

function CharacterConstellations({data}){
  return (
    <section id="constellations" className={ArchivePageCSS.archiveRecordSection}>
      <h2 className="mb-2 text-2xl font-bold">Constellations</h2>
      {data.constellations.map((constellation, index) => (
        <Talent 
          key={index}
          icon={getAssetURL("character", data.name, `c${index + 1}.png`)}
          data={{
            type: "C" + (index + 1),
            name: constellation.name,
            description: constellation.description,
            properties: constellation.properties,
          }}
        />
      ))}
    </section>
  )
}


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
import db from "@/db/db"
import { eq } from "drizzle-orm"
import { commentsTableBG } from "@/db/schema"


//page metadata
export async function generateMetadata({params}) {
  const {id} = await params
  const data = await getCharacter(id)
  if(data === undefined || data === null) return {}
  return {
    title: `${data.name} | Irminsul`,
    description: data.description,
    image: `/assets/characters/${data.key}/${data.key}_splash.png`,
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

  if(data === undefined || data === null) return <div>Character data not found</div>

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CharacterHeader data={data}/>
      <TableOfContents/>
      <div id="pagecontent" className={ArchivePageCSS.archiveRecordContentContainer}>
        <br/>
        <CharacterBaseStats data={data}/>
        <br/>
        <CharacterTalents data={data}/>
        <br/>
        <CharacterPassives data={data}/>
        <br/>
        <CharacterConstellations data={data}/>
        <br/>
        <CommentSection data={data}/>
      </div>
    </Suspense>
  )
}

function CharacterHeader({data}){
  return (
    <Header 
      title={data.name}
      splashImage={`/assets/characters/${data.key}/${data.key}_splash.png`}
      bgImage={`/assets/characters/${data.key}/${data.key}_namecard.png`}
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
      <BaseStatTable 
        table={data.base_stats}
        cost={data.ascension_costs}
      />
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
              icon = `/assets/talents/characters/${data.key}/${data.key}_skill.png`
              break
            case "Elemental Burst":
              icon = `/assets/talents/characters/${data.key}/${data.key}_burst.png`
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
            icon = `/assets/talents/characters/${data.key}/${data.key}_a1.png`
            break
          case "4th Ascension Passive":
            icon = `/assets/talents/characters/${data.key}/${data.key}_a4.png`
            break
          case "Utility Passive":
            icon = `/assets/talents/characters/${data.key}/${data.key}_passive.png`
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
          icon={`/assets/talents/characters/${data.key}/${data.key}_c${index + 1}.png`}
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

async function CommentSection({data}){
  const comments = await getComments(data.key)
  return (
    <section id="comments" className={ArchivePageCSS.archiveRecordSection}>
      <h2 className="mb-2 text-2xl font-bold">Comments</h2>
      <div>
        {comments.map((comment) => (
          <div key={comment.id}>{comment.comment}</div>
        ))}
      </div>
    </section>
  )
}

async function getComments(page: string){
  const comments = await db.select().from(commentsTableBG).where(eq(commentsTableBG.page, page))
  return comments
}

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
import { getAssetURL, getCDNURL } from '@/utils/getAssetURL'
import Link from "next/link"
import Table from "@/components/archive/Table"
import Advertisment from "@/components/ui/Advertisment"
import Loading from "@/app/loading"
import { cookies } from "next/headers"

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
export async function generateStaticParams() {
  const characters = await getCharacters()
  return characters.map((character) => ({
    id: character.key,
    data: character
  }))
}

export default async function CharacterPage({params}) {
  // "use cache"
  // unstable_cacheLife({stale: 300, revalidate: 2592000, expire: undefined})
  const {id} = await params
  const data = params.data ? params.data : await getCharacter(id)

  if(data === undefined || data === null) 
    return <div>Character data not found</div>

  const color = await getMainColor(getAssetURL("character", data.name, "splash.png")) || "rgb(73, 73, 73)"

  return (
      <Suspense fallback={<Loading />}>
          <CharacterHeader data={data}/>
          <TableOfContents/>
          <div id="pagecontent" className={ArchivePageCSS.archiveRecordContentContainer}>
            <br/>
            {/* <CharacterDetails data={data}/> */}
            <CharacterBaseStats data={data}/>
            <CharacterTalents data={data}/>
            <CharacterPassives data={data}/>
            <CharacterConstellations data={data}/>
            <br/>
            <Suspense fallback={<div>Loading...</div>}> 
              <CommentSection pageID={data.key} color={color} />
            </Suspense>
          </div>
          <Advertisment type="card"/>
      </Suspense>
  )
}

async function CharacterHeader({data}){
  const cookieStore = await cookies()
  const theme = cookieStore.get("theme")?.value || "dark"
  return (
    
    <Header 
      title={data.name}
      splashImage={getAssetURL("character", data.name, "splash.png")}
      bgImage={getAssetURL("character", data.name, "namecard.png")}
    >
      <div>
        <div style={{display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap"}}>
          {Array.from({length: data.rarity}).map((_, index) => (
            <i key={index} className="material-symbols-rounded" style={{color: '#FFD700', marginRight: "-5px"}}>star</i>
          ))}

          <p> </p>

          {[data.vision, data.weapon, data.region]
          .filter((item) => item !== undefined && item !== null && item !== "" && item !== "None")
          .map((item, index) => (
            <div key={index} className="flex items-center gap-2" style={{
              borderRadius: "50px",
              border: theme === "dark" ? "1px solid #333" : "1px solid #a5a4a4",
              padding: "2px 8px",
              fontSize: "12px",
              color: theme === "dark" ? "#cacaca" : "#181818",
              backgroundColor: theme === "dark" ? "#181818" : "#e3e3e3",
            }}>
              <Image src={getCDNURL(`/imgs/icons/${item}.png`)} alt={item} width={100} height={100} style={{
                width: "20px", height: "20px", marginRight: "-2px", 
                filter: theme === "dark" || index==0 ? "none" : "invert(1)"
              }}/>
              {toTitleCase(item)}
            </div>
          ))} 
          {/* <div className="flex items-center gap-2" style={{
            borderRadius: "50px",
            border: "1px solid #333",
            padding: "1px 10px",
            fontSize: "12px",
            color: "#cacaca",
            backgroundColor: "#181818",
            marginLeft: "10px",
          }}>
            <Image src={getCDNURL(`/imgs/icons/${data.vision}.png`)} alt={data.vision} width={100} height={100} style={{
              width: "20px", height: "20px"
            }}/>
            {data.vision}
          </div>

          
          <Image src={getCDNURL(`/imgs/icons/${data.weapon}.png`)} alt={data.weapon} width={100} height={100} style={{width: "25px", height: "25px", filter: theme === "dark" ? "none" : "invert(1)"}}/>
          
          <Image src={getCDNURL(`/imgs/icons/${data.region}.png`)} alt={data.region} width={100} height={100} style={{width: "25px", height: "25px", filter: theme === "dark" ? "none" : "invert(1)"}}/> */}

          {/* <span style={{fontSize: "12px", backgroundColor: "#181818", color: "var(--primary-color)", padding: "3px 12px", borderRadius: "50px"}}>
            {data.release_date}
          </span> */}
        </div>
      </div>
      <p>{JSON.stringify(data.description).trim()}</p>
    </Header>
  )
}

function TableOfContents(){
  return (
    <RightSidenav>
      <br />
      <ul>
        {/* <li><Link href="#details">Details</Link></li> */}
        <li><Link href="#basestats">Base Stats</Link></li>
        <li><Link href="#talents">Talents</Link></li>
        <li><Link href="#passives">Passives</Link></li>
        <li><Link href="#constellations">Constellations</Link></li>
      </ul>
      <Advertisment type="card"/>
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
          case "Night Realm's Gift Passive":
            icon = getAssetURL("character", data.name, "passive2.png")
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


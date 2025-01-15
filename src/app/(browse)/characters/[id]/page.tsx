import RightSidenav from "@/components/navigation/RightSidenav"
import { getCharacter, getCharacters } from "@/utils/DataGetters"
import { toTitleCase } from "@/utils/standardizers"
import Image from 'next/image'
import Header from "@/components/archive/Header"
import { Character } from "@/types/character"
import BaseStatTable from "@/components/archive/BaseStatTable"
import Talent from "@/components/archive/Talent"
import { Suspense } from "react"
import ArchiveCSS from "@/components/archive/archive.module.css"

//page metadata
export async function generateMetadata({params}) {
  const {id} = await params
  const name = toTitleCase(id)
  return {
    title: `${name} | Irminsul`,
    description: "",
    image: `/assets/characters/${id}/splash.png`,
    url: `/characters/${id}`,
  }
}

// statically generate all character pages from api at build
// export async function generateStaticParams() {
//   const characters = await getCharacters()
//   return characters.map((character) => ({
//     id: character.key,
//     // data: character
//   }))
// }


export default async function CharacterPage({params}) {
  const id = params.then(p => p.id)
  const data = params.data ? params.data : await getCharacter(await id)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {
        data !== null ? <CharacterContent data={data} /> : <div>data is null</div>
      }
    </Suspense>
  )
}

function CharacterContent({ data }) {
  return (
    <div id="character-page">
      <Header 
        title={data.name}
        splashImage={`/assets/characters/${data.key}/${data.key}_splash.png`}
        bgImage={`/assets/characters/${data.key}/${data.key}_namecard.png`}
      >
        <>
          <div>
            {Array.from({length: data.rarity}).map((_, index) => (
              <i key={index} className="material-symbols-rounded" style={{color: '#FFD700'}}>star</i>
            ))}
          </div>
          <p>A young researcher well-versed in botany who currently serves as a Forest Watcher in Avidya Forest. He is a straight shooter with a warm heart — and a dab hand at guiding even the dullest of pupils.</p>
        </>
      </Header>

      <RightSidenav>
        <ul>
          <li><a href="#basestats">Base Stats</a></li>
          <li><a href="#talents">Talents</a></li>
          <li><a href="#passives">Passives</a></li>
          <li><a href="#constellations">Constellations</a></li>
        </ul>
      </RightSidenav>

      <div className={ArchiveCSS.archiveRecordContentContainer} >
        <div id="basestats" style={{paddingTop: "60px"}}>
          <h2 className="mb-2 text-2xl font-bold">Base Stats</h2>
          <BaseStatTable 
            table={data.base_stats}
            cost={data.ascension_costs}
          />
        </div>

        <div id="talents" style={{paddingTop: "60px"}}>
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
        </div>


        <div id="passives" style={{paddingTop: "60px"}}>
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
        </div>


        <div id="constellations" style={{paddingTop: "60px"}}>
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
        </div>
      </div>
    </div>
  )
}
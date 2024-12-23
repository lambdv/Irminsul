import RightSidenav from "@/components/navigation/RightSidenav"
import { getCharacter, getCharacters } from "@/utils/DataGetters"
import { toTitleCase } from "@/utils/standardizers"
import Image from 'next/image'

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

//statically generate all character pages from api at build time
export async function generateStaticParams() {
  const characters = await getCharacters()
  return characters.map((character) => ({
    id: character.id,
    data: character
  }))
}

/**
 * Page containing details for individual characters in the game
 */
export default async function CharacterPage({params}) {
  const {id} = await params
  const data = params.data ? params.data : await getCharacter(id)
  const name = id.toLowerCase().replaceAll("-", " ")
  return (
    <div id="character-page">
      <div 
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `url(/assets/characters/${id}/banner.png)`,
        }}
      >
        <div>
          <h1 className="bold">{data.name}</h1>
          <p>{data.description}</p>
        </div>
        <Image
          src={`/assets/characters/${id}/splash.png`}
          alt={name}
          width={500}
          height={500}
        />
      </div>

      <RightSidenav>
        <ul>
          <li><a href="#basestats">Base Stats</a></li>
          <li><a href="#basestats">Ascention</a></li>
          <li><a href="#basestats">Constellations</a></li>
          <li><a href="#basestats">Talents</a></li>
          <li><a href="#basestats">Passives</a></li>
        </ul>
      </RightSidenav>

      <div>
        <h1>base stats</h1>
      </div>

      
      <div>
        <h1>talents</h1>
        {/* {
          data.talents.map(talent => (
            <div key={talent.name}>
              <h2>{talent.name}</h2>
              <p>{talent.description}</p>
            </div>
          ))
        } */}
      </div>




      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{JSON.stringify(value)}</td>
            </tr>
          ))}

        </tbody>
      </table>
    </div>
  )
}
  
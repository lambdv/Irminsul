// import RightSidenav from "@/components/navigation/RightSidenav"
// import { getCharacter, getCharacters } from "@/utils/DataGetters"
// import { toTitleCase } from "@/utils/standardizers"
// import Image from 'next/image'
// import Header from "@/components/archive/Header"

// //page metadata
// export async function generateMetadata({params}) {
//   const {id} = await params
//   const name = toTitleCase(id)
//   return {
//     title: `${name} | Irminsul`,
//     description: "",
//     image: `/assets/characters/${id}/splash.png`,
//     url: `/characters/${id}`,
//   }
// }

// //statically generate all character pages from api at build time
// export async function generateStaticParams() {
//   const characters = await getCharacters()
//   return characters.map((character) => ({
//     id: character.key,
//     data: character
//   }))
// }

// /**
//  * Page containing details for individual characters in the game
//  */
// export default async function CharacterPage({params}) {
//   const {id} = await params
//   const data = params.data ? params.data : await getCharacter(id)
//   return (
//     <div id="character-page">

//       <Header 
//         title={data.name}
//         splashImage={`/assets/characters/${data.key}/${data.key}_splash.png`}
//         bgImage={`/assets/characters/${data.key}/${data.key}_namecard.png`}
//       >
//         <>
//           <div>
//             {Array.from({length: data.rarity}).map((_, index) => (
//               <i key={index} className="material-symbols-rounded"
//                 style={{
//                   color: '#FFD700',
//                 }}
//               >star</i>
//             ))}
//           </div>
//           <p>A young researcher well-versed in botany who currently serves as a Forest Watcher in Avidya Forest. He is a straight shooter with a warm heart — and a dab hand at guiding even the dullest of pupils.</p>
//         </>
//       </Header>


//       <RightSidenav>
//         <ul>
//           <li><a href="#basestats">Base Stats</a></li>
//           <li><a href="#basestats">Ascention</a></li>
//           <li><a href="#basestats">Constellations</a></li>
//           <li><a href="#basestats">Talents</a></li>
//           <li><a href="#basestats">Passives</a></li>
//         </ul>
//       </RightSidenav>

//       <div
//         style={{
//           padding: '50px',
//         }}
//       >
//         <div>
//           <h2>Base Stats</h2>
//           <table>
//             <thead>
//               <tr>
//                 <th>LVL</th>
//                 <th>BaseHP</th>
//                 <th>BaseATK</th>
//                 <th>BaseDEF</th>
//                 <th>AscensionStatType</th>
//                 <th>AscensionStatValue</th>
//                 <th>AscensionPhase</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.base_stats.map((stat, index) => (
//                 <tr key={index}>
//                   <td>{stat.LVL}</td>
//                   <td>{stat.BaseHP}</td>
//                   <td>{stat.BaseATK}</td>
//                   <td>{stat.BaseDEF}</td>
//                   <td>{stat.AscensionStatType}</td>
//                   <td>{stat.AscensionStatValue}</td>
//                   <td>{stat.AscensionPhase}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>  
//         <br/>
          
//         <div>
//           <h2>Talents</h2>
//           {data.talents.map((talent, index) => (
//             <div key={index}>
//               <h2>{talent.name}</h2>
//               <p>{talent.description}</p>

//               <table>
//                 <thead>
//                   <tr>
//                     <th>Hit</th>
//                     {
//                       talent.attributes?.[0]?.values?.map((value, index) => (
//                         <th key={index}>Lvl {index+1}</th>
//                       ))
//                     }
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {
//                     talent.attributes?.map((attribute, index) => (
//                       <tr key={index}>
//                         <td>{attribute.hit}</td>
//                         {
//                           attribute.values?.map((value, index) => (
//                             <td key={index}>{value}</td>
//                           ))
//                         }
//                       </tr>
//                     ))
//                   }
//                 </tbody>
//               </table>
//               <br/>
//             </div>
//           ))}
//         </div>

//         <br/>

//         <div>
//           <h2>Constellations</h2>
//           {data.constellations.map((constellation, index) => (
//             <div key={index}>
//               <h2>{constellation.name}</h2>
//               <p>{constellation.description}</p>
//             </div>
//           ))}
//         </div>

//       </div>
//     </div>
//   )
// }
  
import RightSidenav from "@/components/navigation/RightSidenav"
import { getCharacter, getCharacters } from "@/utils/DataGetters"
import { toTitleCase } from "@/utils/standardizers"
import Image from 'next/image'
import Header from "@/components/archive/Header"
import { Character } from "@/types/character"
import BaseStatTable from "@/components/archive/BaseStatTable"
import Talent from "@/components/archive/Talent"
import { Suspense } from "react"

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

// //statically generate all character pages from api at build time
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
      <CharacterContent data={data} />
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
          <li><a href="#ascention">Ascention</a></li>
          <li><a href="#constellations">Constellations</a></li>
          <li><a href="#talents">Talents</a></li>
          <li><a href="#passives">Passives</a></li>
        </ul>
      </RightSidenav>

      <div style={{padding: '50px'}}>
        <div>
          <h2 className="mb-2 text-2xl font-bold">Base Stats</h2>
          <BaseStatTable 
            table={data.base_stats}
            cost={data.ascension_costs}
          />
        </div>

        <br/>

        <div>
          <h2 className="mb-2 text-2xl font-bold">Talents</h2>
          {data.talents.map((talent, index) => (
              <Talent 
                key={index}
                data={talent}
              />
          ))}
        </div>

        <br/>

        <div>
          <h2 className="mb-2 text-2xl font-bold">Passives</h2>
          {data.passives.map((passive, index) => (
            <Talent 
              key={index}
              data={passive}
            />
          ))}
        </div>

        <br/>

        <div>
          <h2 className="mb-2 text-2xl font-bold">Constellations</h2>
          {data.constellations.map((constellation, index) => (
            <Talent 
              key={index}
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
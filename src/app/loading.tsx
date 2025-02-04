import React from 'react'
import Image from 'next/image'
export default function loading() {
  return (
    <div className="justify-center items-center">
      <p>loading...</p>
        {/* <Icon/>
        <FunFact/>
        <ElementLoader/> */}
    </div>
  )
}


// function Icon(){
//     return (
//         <div className="flex flex-box justify-center items-center">
//           <Image src="/imgs/icons/liyue.png" alt="irminsul" width={100} height={100} />
//         </div>
//     )
// }

// function FunFact(){
//   const fact = facts[Math.floor(Math.random() * facts.length)];
//   return (
//       <div className="flex flex-box justify-center items-center">
//         <p>{fact}</p>
//       </div>
//   )
// }

// function ElementLoader(){
//   return (
//     <div className="flex flex-box justify-center items-center">
//       <Image src="/imgs/icons/pyro.png" alt="pyro" width={100} height={100} />
//       <Image src="/imgs/icons/hydro.png" alt="hydro" width={100} height={100} />
//       <Image src="/imgs/icons/anemo.png" alt="anemo" width={100} height={100} />
//       <Image src="/imgs/icons/electro.png" alt="electro" width={100} height={100} />
//       <Image src="/imgs/icons/dendro.png" alt="dendro" width={100} height={100} />
//       <Image src="/imgs/icons/cryo.png" alt="cryo" width={100} height={100} />
//       <Image src="/imgs/icons/geo.png" alt="geo" width={100} height={100} />
//     </div>
//   )
// }

// const facts = [
//   "The name Teyvat is derived from the Sanskrit word 'Tejasvat,"
// ]
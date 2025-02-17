import Image from 'next/image'

export default function Loading() {
  //wait for 1 second server side

  return (
    <div className="fixed inset-0 flex flex-col items-center">
      <div className="flex-1 flex items-center" style={{marginTop: '-10rem'}}>
        <Icon />
      </div>
      <div style={{position: 'fixed', bottom: '10%', left: '50%', transform: 'translateX(-50%)'}}>
        <FunFact />
        <div style={{marginTop: '2rem'}}>
          {/* <ElementLoader /> */}
        </div>
      </div>
    </div>
  )
}

function Icon() {
  return (
    <div className="flex justify-center">
      <div className="relative animate-pulse">
        <Image 
          src="/imgs/icons/g_natlan.png" 
          alt="natlan" 
          width={100}
          height={100}
          className="object-contain"
        />
      </div>
    </div>
  )
}

function FunFact() {
  let fact = facts[Math.floor(Math.random() * facts.length)];
  
  return (
    <div className="text-center">
      <p style={{fontSize: '1.2rem', fontWeight: '200', color: 'var(--ingame-primary-color)', fontFamily: 'ingame'}}>{fact.title || 'Natlan'}</p>
      <p style={{fontSize: '0.8rem', fontWeight: '200', color: 'var(--ingame-primary-color)', fontFamily: 'ingame', width: '50%', margin: '0 auto'}}>{fact.description || 'All victory and glory belongs to the Pyro Archon.'}</p>
    </div>
  )
}

function ElementLoader() {
  const elements = ['pyro', 'hydro', 'anemo', 'electro', 'dendro', 'cryo', 'geo']

  return (
    <div className="relative flex justify-center">
      <div className="absolute flex justify-center w-full">
        {elements.map((element) => (
          <Image 
            src={`/imgs/icons/b_${element}.png`}
            alt={element}
            width={30}
            height={30}
            key={`${element}-inverted`}
            style={{filter: "invert(0)"}}
          />
        ))}
      </div>
    </div>
  )
}

//https://genshin-impact.fandom.com/wiki/Loading_Screen/Natlan
const facts = [
  {title: "Adventurers' Guild", description: "The Adventurers' Guild is active all across Teyvat, exploring new lands filled with mystery and secrets. Even when faced with climates as extreme and dangerous as that of Dragonspine, its members remain all the more steadfast."},
  {title: "Dragonspine", description: "A civilization once flourished in the lands of Dragonspine, only to be destroyed by a turbulent change in climate. The black dragon fell upon Dragonspine long ago, and its blood seems to have seeped into the ground..."},
  {title: "Mondstadt", description: "A city of freedom that lies in the northeast. From the mountains to the wide-open plains, the carefree breeze carries the scent of dandelions — a gift from the Anemo God — to an island in the middle of Cider Lake, on which sits the city of Mondstadt."},
  {title: "The Fatui", description: "A Snezhnayan organization that seeks only power. They are all the more active in regions full of mystery and ruins such as Dragonspine."},
  {title: "Subzero Climate", description: "Sheer Cold will quickly accumulate in the Subzero Climate, eventually dealing DMG to characters. Perhaps the ruins scattered across Dragonspine are remnants of a civilization destroyed in the bitter cold..."},
  {title: "Wolvendom", description: "A revered and ancient spirit holds court in this land. It is the realm of the wolves, and thus was its name derived."},
]
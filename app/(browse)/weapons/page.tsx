import React from 'react'; 
import explorePageCSS from '@/components/explore/explorePage.module.css'
import WeaponItemList from '@/components/explore/WeaponItemList'
import BrowseHeader from '@/components/explore/BrowseHeader'

export const metadata = {
  title: "Weapons | Irminsul",
};

/**
 * Function that fetches all weapons from the genshin API
 * @returns 
 */
async function getWeapons(){
  const res = await fetch('https://genshin.jmp.blue/weapons', {
      next: {
          revalidate: 60 * 60 * 24 * 7 // weekly
      }
  })

  const weapons = await res.json()
  const weaponDataPromises = weapons.map(async (weapon) => {
    const weaponData = await fetch(`https://genshin.jmp.blue/weapons/${weapon}`, {
        next: {
            revalidate: 60 * 60 * 24 * 7 // weekly
        }
    })
    return weaponData.json();
  })

  const weaponDataList = await Promise.all(weaponDataPromises);
  return weaponDataList;
}

export default async function Weapons() {
  const weapons = await getWeapons()
  return (
    <div id="weapon-page">
      <BrowseHeader page="weapon" icon={undefined} title={''}/>
      <WeaponItemList weapons={weapons}/>
    </div>
  );
}
  
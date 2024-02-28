import React from 'react'; 
import explorePageCSS from '@/css/explorePage.module.css'
import WeaponItemList from '@/components/explore/WeaponItemList'
import BrowseHeader from '@/components/explore/BrowseHeader'

export const metadata = {
  title: "Weapons | Irminsul",
};

async function getWeapons(){
  const response = await fetch('https://genshin.jmp.blue/weapons', {
      next: {
          revalidate: 60 * 60 * 24 * 7 // weekly
      }
  })
  return response.json()
}

export default async function Weapons() {

  const weapons = await getWeapons();
  const weaponDataPromises = weapons.map(async (weapon) => {
    const weaponData = await fetch(`https://genshin.jmp.blue/weapons/${weapon}`, {
        next: {
            revalidate: 60 * 60 * 24 * 7 // weekly
        }
    })
    return weaponData.json();
  });
  const weaponDataList = await Promise.all(weaponDataPromises);

  return (
    <div id="weapon-page">
      <BrowseHeader page="weapon"/>
      <WeaponItemList weapons={weaponDataList}/>
    </div>
  );
}
  
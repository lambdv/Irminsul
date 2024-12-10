import React from 'react'; 
import explorePageCSS from '@/components/explore/explorePage.module.css'
import WeaponItemList from '@/components/explore/WeaponItemList'
import BrowseHeader from '@/components/explore/BrowseHeader'
import weaponIcon from '@/public/assets/icons/weaponIcon.png'
import {WeaponFilterStore} from '@/store/WeaponFilters'


export const metadata = {
  title: "Weapons | Irminsul",
};

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
      <BrowseHeader
        title="Weapons"
        icon={weaponIcon} 
        page="weapon"
        //filters= {filters}
        store={WeaponFilterStore}
      />
      <WeaponItemList 
        weapons={weapons}
      />
    </div>
  );
}
  
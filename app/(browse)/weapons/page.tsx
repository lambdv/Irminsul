import React from 'react'; 
import explorePageCSS from '@/components/explore/explorePage.module.css'
import WeaponItemList from '@/app/(browse)/weapons/WeaponItemList'
import ItemsContainer from '@/components/explore/ItemsContainer'
import BrowseHeader from '@/components/explore/BrowseHeader'
import weaponIcon from '@/public/assets/icons/weaponIcon.png'
import {WeaponFilterStore} from '@/store/WeaponFilters'
import {getWeapons} from '@/utils/DataGetters'

export const metadata = {
  title: "Weapons | Irminsul",
};



export default async function Weapons() {
  const weapons = await getWeapons()
  return (
    <div id="weapon-page">
      <BrowseHeader
        title="Weapons"
        icon={weaponIcon} 
        store={WeaponFilterStore}
      />
      {/* <ItemsContainer 
        data={weapons}
        store={WeaponFilterStore}
        type="weapon" 
      /> */}
      <WeaponItemList data={weapons} />
    </div>
  );
}
  
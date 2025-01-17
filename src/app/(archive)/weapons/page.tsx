import React from 'react' 
import explorePageCSS from '@/components/explore/explorePage.module.css'
import WeaponItemList from './WeaponItemList'
import ItemsContainer from '@/components/explore/ItemsContainer'
import BrowseHeader from '@/components/explore/BrowseHeader'
import weaponIcon from '@public/imgs/icons/weaponIcon.png'
import {WeaponFilterStore} from '@/store/WeaponFilters'
import {getWeapons} from '@/utils/genshinData'

export const metadata = {
  title: "Weapons | Irminsul",
}

export default async function Weapons() {
  const weapons = await getWeapons()
  return (
    <div id="weapon-page">
      <BrowseHeader
        title="Weapons"
        icon={weaponIcon} 
        store={WeaponFilterStore}
      />
      <WeaponItemList data={weapons} />
    </div>
  )
}
  
import React from 'react'; 
import explorePageCSS from '@/components/explore/explorePage.module.css';
import CharacterItemList from '@/components/explore/CharacterItemList';
import BrowseHeader from '@/components/explore/BrowseHeader';
import CharacterBrowseHeader from '@/components/explore/CharacterBrowseHeader';

import characterIcon from '@/public/assets/icons/characterIcon.png'

export const metadata = {
  title: "Characters | Irminsul",
};

/**
 * Function that fetches all characters from the genshin API
 * @returns 
 */
async function getCharacters(){
  const res = await fetch('https://genshin.jmp.blue/characters', {
      next: {
          revalidate: 60 * 60 * 24 * 7 // weekly
      }
  })
  const characters = await res.json()
  const characterDataPromises = characters.map(async (character) => {
    const characterData = await fetch(`https://genshin.jmp.blue/characters/${character}`, {
        next: {
            revalidate: 60 * 60 * 24 * 7 // weekly
        }
    })
    return characterData.json();
  });
  const characterDataList = await Promise.all(characterDataPromises);
  return characterDataList;
}


export default async function Characters({searchParams}) {

  const characterDataList = await getCharacters();

  const rarityFilters = ["5-star", "4-star"];
  const elementFilters=  ["Pyro", "Hydro", "Dendro", "Electro", "Anemo", "Cryo", "Geo"];
  const weaponFilters = ["Sword", "Claymore", "Bow", "Polearm", "Catalyst"];
  const statFilters = ["ATK", "DEF", "HP", "Crit Rate", "Crit DMG", "Elemental Mastery", "Energy Recharge", "Healing Bonus", "Physical DMG Bonus", "Pyro DMG Bonus", "Hydro DMG Bonus", "Dendro DMG Bonus", "Electro DMG Bonus", "Anemo DMG Bonus", "Cryo DMG Bonus", "Geo DMG Bonus"];
  const filters = [{rarityFilters}, {elementFilters}, {weaponFilters}, {statFilters}];
  //const searchQuery: string = searchParams.search || "";
  //const selectedFilters = Array.isArray(searchParams.filters) ? searchParams.filters : [searchParams.filters].filter(Boolean);

  return (
    <div id="characters-page">
      <CharacterBrowseHeader
        icon={characterIcon}
        title="Characters"
        filters= {filters}
        //store="CharacterFilterStore"
      />

      <CharacterItemList 
        characters={characterDataList}
        filters= {filters}
        //store="CharacterFilterStore"
      />

    </div>
  );
}
  
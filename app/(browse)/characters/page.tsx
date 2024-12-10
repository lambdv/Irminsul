import React from 'react'; 
import explorePageCSS from '@/components/explore/explorePage.module.css';
import CharacterItemList from '@/components/explore/CharacterItemList';
import BrowseHeader from '@/components/explore/BrowseHeader';
import characterIcon from '@/public/assets/icons/characterIcon.png'
import {CharacterFilterStore} from '@/store/CharacterFilters'

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

  return (
    <div id="characters-page">
      <BrowseHeader
        icon={characterIcon}
        title="Characters"
        //filters= {filters}
        store={CharacterFilterStore}
        page="character"
      />
      <CharacterItemList 
        characters={characterDataList}
        //store="CharacterFilterStore"
      />

    </div>
  );
}
  
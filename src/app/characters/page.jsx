import React from 'react'; 
import explorePageCSS from '@/css/explorePage.module.css'
import CharacterItemList from '@/components/explore/CharacterItemList'
import BrowseHeader from '@/components/explore/BrowseHeader'

export const metadata = {
  title: "Characters | Irminsul",
};

async function getCharacters(){
  const response = await fetch('https://genshin.jmp.blue/characters', {
      next: {
          revalidate: 60 * 60 * 24 * 7 // weekly
      }
  })
  return response.json()
}

export default async function Characters() {

  const characters = await getCharacters();
  const characterDataPromises = characters.map(async (character) => {
    const characterData = await fetch(`https://genshin.jmp.blue/characters/${character}`, {
        next: {
            revalidate: 60 * 60 * 24 * 7 // weekly
        }
    })
    return characterData.json();
  });
  const characterDataList = await Promise.all(characterDataPromises);

  return (
    <div id="characters-page">
      <BrowseHeader page="character"/>
      <CharacterItemList characters={characterDataList}/>
    </div>
  );
}
  
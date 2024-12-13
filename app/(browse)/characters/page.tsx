import React from 'react'; 
import explorePageCSS from '@/components/explore/explorePage.module.css';
import CharacterItemList from '@/app/(browse)/characters/CharacterItemList';
import ItemsContainer from '@/components/explore/ItemsContainer';

import BrowseHeader from '@/components/explore/BrowseHeader';
import characterIcon from '@/public/assets/icons/characterIcon.png'
import {CharacterFilterStore} from '@/store/CharacterFilters'
import {getCharacters} from '@/utils/DataGetters'
import Loading from '../loading';

export const metadata = {
  title: "Characters | Irminsul",
};



export default async function Characters({searchParams}) {
  const characters = await getCharacters();
  return (
    <div id="characters-page">
      <BrowseHeader
        icon={characterIcon}
        title="Characters"
        store={CharacterFilterStore}
      />
      <CharacterItemList 
        data={characters}
      />
      {/* <ItemsContainer
        data={characters}
        store={CharacterFilterStore}
        type="character"
      /> */}
    </div>
  );
}
  
import React from 'react'; 
import explorePageCSS from '../../../css/explorePage.module.css'
import CharacterItemList from '../../../components/explore/CharacterItemList'
import Header from '../../../components/explore/header'

export const metadata = {
  title: "Characters | Irminsul",
};

export default function Characters() {

  return (
    <div id="characters-page">
      <Header/>
      <CharacterItemList/>
    </div>
  );
}
  
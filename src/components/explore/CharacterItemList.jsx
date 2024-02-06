import useFetch from '../../hooks/useFetch.js'
import Item from '../../components/explore/Item.jsx'
import explorePageCSS from '../../css/explorePage.module.css'

async function getCharacters(){
    const response = await fetch('https://genshin.jmp.blue/characters', {
        next: {
            revalidate: 60 * 60 * 24 * 7 // weekly
        }
    })
    return response.json()
}

export default async function CharacterItemList() {

    const characters = await getCharacters();

    const characterDataPromises = characters.map(async (character) => {
        const characterData = await useFetch(`https://genshin.jmp.blue/characters/${character}`);
        return characterData;
    });

    const characterDataList = await Promise.all(characterDataPromises);

    return (
        <div className={explorePageCSS.itemContainer}>

            {characterDataList.map((characterData, index) => (
                <Item 
                    rarity={characterData.rarity}
                    tags={ (characterData.rarity)+`-star ` + (characterData.vision) + ` ` + (characterData.weapon)} 
                    key={index} 
                    name={characterData.name}
                    element={characterData.vision}
                    src={`https://raw.githubusercontent.com/scafiy/Irminsul/master/src/assets/characters/${characters[index]}/profile.png`}
                />
            ))}

        </div>
    )
}


import useFetch from '../../hooks/useFetch.js'
import Item from '../../components/explore/Item.jsx'
import explorePageCSS from '../../css/explorePage.module.css'


export default async function CharacterItemList() {

    const characters = await useFetch('https://genshin.jmp.blue/characters', {
        next: {
            revalidate: 60 * 20 //20 minuites
        }
    })

    return (
        <div className={explorePageCSS.itemContainer}>
            {
                characters.map((character, index) => (
                    <Item key={index} name={character} src={`https://raw.githubusercontent.com/scafiy/AkashaDB/main/images/characters/${character}/profile.png`}/> 
                ))
            } 
        </div>
    )
}

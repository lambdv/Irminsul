import Link from 'next/link'
import ItemCSS from '@/css/item.module.css'

export default function Item(props) {
    const src = props.src
    const name = props.name
    const element = props.element.toLowerCase()

    return (
        <div id={props.tags} className={ItemCSS.item + ` waves-effect waves-light ripple ` + ` item `} style={{width:"110px"}} >
            <Link href={`/characters/${name.toLowerCase().replace(" ", "-")}`}>
                { props.element && <img className={ItemCSS.itemCategory} src={`https://raw.githubusercontent.com/scafiy/Irminsul/master/src/assets/icons/${element}.png`}/>}
                <div className={ItemCSS.itemIcon + ` bg-${props.rarity}-star`}>
                    <img src={src} className={ItemCSS.itemImg} alt=" "/>
                </div>
                <p className={ItemCSS.itemText}>{name}</p>
            </Link>
        </div>
    )
}

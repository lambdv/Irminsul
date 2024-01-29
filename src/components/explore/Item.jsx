import Link from 'next/link'
import ItemCSS from '../../css/item.module.css'

export default function Item(props) {
    const src = props.src
    const name = props.name

    return (
        <div className={ItemCSS.item + ` waves-effect waves-light ripple`} style={{width:"110px"}} >
            <Link href={`/characters/${name}`}>
                {/* <img className={ItemCSS.itemCategory} src="https://akashadb.netlify.app/images/icons/Dendro.png"/> */}
                <div className={ItemCSS.itemIcon + ` bg-5-star`}>
                    <img src={src} className={ItemCSS.itemImg}/>
                </div>
                <p className={ItemCSS.itemText}>{name}</p>
            </Link>
        </div>
    )
}

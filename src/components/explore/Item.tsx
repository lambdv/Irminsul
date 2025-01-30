import Link from 'next/link'
import ItemCSS from './item.module.css'
import Image from "next/image"
import {flatten, toKey} from '@/utils/standardizers'
import placeholder from '@public/imgs/icons/fallback.png'


export default function Item(props: {
    category: string,
    src: string,
    name: string,
    element?: string,
    rarity: number,
    alt?: string,
    style?: React.CSSProperties,
    href?: string,
}) {
    const isLargeItem: boolean = props.category == "weapon" || props.category == "artifact"
    const hasElement: boolean = props.element !== null && props.category == "character"
    const hasStarsDisplayed: boolean = props.category == "artifact" || props.category == "weapon"
    const id = toKey(props.name)
    return (
        <div className={
                ItemCSS.item + 
                ` waves-effect waves-light ripple ` + 
                ` item `
            } 
            style={{ 
                height: isLargeItem && "150px",
                ...props.style
            }}
        >
            <Link href={props.href || `/archive/${props.category}s/${id}`}>
                {hasElement && 
                    <Image className={ItemCSS.itemCategory} src={`/imgs/icons/${flatten(props.element)}.png`} alt=" " width="100" height="100"/>
                }
                {hasStarsDisplayed && 
                    <div className={ItemCSS.itemRarity}>
                        {[...Array(props.rarity)].map((_, index) => (
                            <i key={index} className="material-symbols-rounded">star</i>
                        ))}
                    </div>
                }
                <div className={ItemCSS.itemIcon + ` bg-${props.rarity}-star`}>
                    {/* <Image 
                        src={props.src} 
                        className={ItemCSS.itemImg} 
                        alt={props.alt || props.name}
                        width={500} 
                        height={500}
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={placeholder.src}
                    /> */}
                    <img src={props.src} alt={props.alt || props.name}/>
                </div>
                <p 
                    className={ItemCSS.itemText} 
                    style={{ 
                        fontSize: isLargeItem ? "12px" : "inherit",
                        height: isLargeItem && "35px"
                    }}
                >   
                    {props.name.length > 22 ? props.name.substring(0, 22) + '...' : props.name}
                </p>
            </Link>
        </div>
    )
}
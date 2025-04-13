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
    scale?: number,
    showStars?: boolean,
}) {

    const id = toKey(props.name)
    const isLargeItem: boolean = props.category == "weapon" || props.category == "artifact"
    const hasElement: boolean = props.element !== null && props.category == "character"
    const hasStarsDisplayed: boolean = props.showStars !== false && (props.category == "artifact" || props.category == "weapon")

    return (
        <div className={ItemCSS.item + ` waves-effect waves-light ripple ` + ` item `} 
            style={{ 
                ...props.style,
                width: props.scale ? props.scale * 110 : "110px",
                height: props.scale ? props.scale * (isLargeItem ? 150 : 135) : (isLargeItem ? "150px" : "135px"),
            }}
            title={props.alt || props.name}
        >

            <Link href={props.href || `/archive/${props.category}s/${id}`}>

                {hasElement && 
                    <Image className={ItemCSS.itemCategory} 
                        src={`/imgs/icons/${flatten(props.element)}.png`} 
                        alt=" " 
                        width={props.scale ? props.scale * 25 : 25} 
                        height={props.scale ? props.scale * 25 : 25}
                        loading="lazy"
                        unoptimized
                    />
                }


                {hasStarsDisplayed && 
                    <div className={ItemCSS.itemRarity} style={{
                        bottom: props.scale ? props.scale * 42.5 : "42.5px",
                        fontSize: props.scale ? props.scale * 10 : "10px",
                        padding: props.scale ? props.scale * 10 : "10px",
                    }}>
                        {[...Array(props.rarity)].map((_, index) => (
                            <i key={index} className="material-symbols-rounded" style={{
                                fontSize: props.scale ? props.scale * 20 : "20px",
                                marginRight: props.scale ? props.scale * -4 : "-4px",
                            }}>star</i>
                        ))}
                    </div>
                }

                <div className={ItemCSS.itemIcon + ` bg-${props.rarity}-star`} style={{
                    width: props.scale ? props.scale * 110 : "110px",
                    height: props.scale ? props.scale * 110 : "110px",
                }}>
                    <Image 
                        src={props.src} 
                        className={ItemCSS.itemImg} 
                        alt={props.alt || props.name}
                        width={props.scale ? props.scale * 500 : 500} 
                        height={props.scale ? props.scale * 500 : 500}
                        loading="lazy"
                        // placeholder="blur"
                        // blurDataURL={placeholder.src}
                        unoptimized
                    />
                </div>

                <p className={ItemCSS.itemText} style={{ 
                    fontSize: props.scale ? props.scale * (isLargeItem ? 12 : 12) : (isLargeItem ? "12px" : "12px"),
                    height: isLargeItem ? (props.scale ? props.scale * 35 : "35px") : "auto"
                }}>   
                    {props.name.length > 22 ? props.name.substring(0, 22) + '...' : props.name}
                </p>
            </Link>
        </div>
    )
}
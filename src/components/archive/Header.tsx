import HeaderCSS from './header.module.css'
import Image from 'next/image'
import { getMainColor } from '@/utils/getMainColor'


export default async function Header(props: {
    title: string 
    splashImage: string
    bgImage?: string
    color?: string
    children?: React.ReactNode
}) {
    let color = await getMainColor(props.splashImage) || "rgb(0,0,0)"

    return (
        <div 
            className={HeaderCSS.archiveRecordHeader}
            style={{
                boxShadow: `0px 0px 1000px -50px rgba(${color.slice(4, -1)}, 0.4)`
            }}
        > 
            <div className={HeaderCSS.archiveRecordHeaderWrapper} style={{ 
                backgroundImage: props.bgImage ? `url(${props.bgImage})` : 'none', 
                backgroundColor: props.color || color,
            }}>
                <div className={HeaderCSS.archiveRecordHeaderDetailsContainer}
                    style={{
                        backgroundImage: `linear-gradient(to left, rgba(${color.slice(4, -1)}, 0.2), var(--background-color) 80%)`,
                        backdropFilter: `blur(5px)`,

                    }}
                >
                    <div className={HeaderCSS.archiveRecordHeaderDetailsContent} id={HeaderCSS.archiveRecordHeaderTitle}>
                        <h1>{props.title}</h1>
                        {props.children}
                    </div>
                </div>
                
                <div className={HeaderCSS.archiveRecordHeaderSplash}>
                    <Image
                        src={props.splashImage}
                        alt={props.title}
                        width={1000}
                        height={1000}
                    />
                </div>
            </div>
        </div>
    )
}

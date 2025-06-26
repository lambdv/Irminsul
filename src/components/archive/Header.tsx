import HeaderCSS from './header.module.css'
import Image from 'next/image'
import { getMainColor } from '@/utils/getMainColor'

export default async function Header(props: {
    title: string 
    splashImage: string
    bgImage?: string
    color?: string
    children?: React.ReactNode
    imageStyle?: React.CSSProperties,
    bgStyle?: React.CSSProperties,
    gradientStyle?: React.CSSProperties,
    colorStrength?: number
}){
    let color = await getMainColor(props.splashImage) || "rgb(0,0,0)"
    const headerGlow = {boxShadow: `0px 0px 1000px 0px rgba(${color.slice(4, -1)}, 0.5)`}
    const headerBackground = { backgroundImage: props.bgImage ? `url(${props.bgImage})` : 'none', backgroundColor: props.color || color}
    const headerGradient = {backgroundImage: `linear-gradient(to left, rgba(${color.slice(4, -1)}, ${props.colorStrength || 0.2}), var(--background-color) 80%)`, backdropFilter: `blur(5px)`}

    console.log(color)

    return (
        <div className={HeaderCSS.archiveRecordHeader} style={headerGlow}>
            <div className={HeaderCSS.archiveRecordHeaderWrapper} style={{...headerBackground, ...props.bgStyle}}>
                <div className={HeaderCSS.archiveRecordHeaderDetailsContainer} style={{...headerGradient, ...props.gradientStyle}}>
                    <div className={HeaderCSS.archiveRecordHeaderSplash}>
                        <Image
                            width={1000}
                            height={1000}
                            src={props.splashImage}
                            alt={props.title}
                            style={props.imageStyle}
                            priority={false}
                            loading="eager"
                            unoptimized={false}
                        />
                    </div>
                    <div className={HeaderCSS.archiveRecordHeaderDetailsContent} id={HeaderCSS.archiveRecordHeaderTitle}>
                        <h1>{props.title}</h1>
                        {props.children}
                    </div>
                </div>
            </div>
            {/* <style>{`::selection { background-color: ${color}; color: black;}`}</style> */}
            <style>{`
                :root { --primary-color: ${color}; }
            `}</style>
        </div>
    )
}

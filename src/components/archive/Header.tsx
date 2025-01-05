import HeaderCSS from './header.module.css'
import Image from 'next/image'
import { createCanvas, loadImage } from 'canvas'

async function getMainColor(imageURL: string) {
    // Convert relative URL to absolute URL
    const absoluteURL = process.cwd() + '/public' + imageURL
        
        
    const img = await loadImage(absoluteURL);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const colorMap = new Map<string, number>();
    
    // Go through each pixel (rgba values are in groups of 4)
    for(let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1]; 
        const b = data[i + 2];
        const a = data[i + 3];
        
        // Skip transparent pixels
        if(a < 128) continue;
        
        const color = `rgb(${r},${g},${b})`;
        colorMap.set(color, (colorMap.get(color) || 0) + 1);
    }
    
    // Find color with highest count
    let maxCount = 0;
    let dominantColor = '';
    
    colorMap.forEach((count, color) => {
        if(count > maxCount) {
            maxCount = count;
            dominantColor = color;
        }
    });
    
    return dominantColor;
}

export default async function Header(props: {
    title: string 
    splashImage: string
    bgImage?: string
    color?: string
    children?: React.ReactNode
}) {
    let color = "white"
    color = await getMainColor(props.splashImage)
    
    return (
        <div 
            className={HeaderCSS.archiveRecordHeader}
            style={{
                boxShadow: `0px 0px 1000px -20px rgba(${color.slice(4, -1)}, 0.4)`
            }}
        > 
            <div className={HeaderCSS.archiveRecordHeaderWrapper} style={{ 
                backgroundImage: props.bgImage ? `url(${props.bgImage})` : color, 
                backgroundColor: props.color || color, 
            }}>
                <div className={HeaderCSS.archiveRecordHeaderDetailsContainer}
                    style={{
                        backgroundImage: `linear-gradient(to left, rgba(${color.slice(4, -1)}, 0.5), var(--background-color) 80%)`,
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

import { toKey } from "@/utils/standardizers"
import path from "path"
import 'dotenv/config';

let cdn = "https://raw.githubusercontent.com/lambdv/genshin-scraper/refs/heads/main/genshindata/public/"

/**
 * Utility function to get the url for an asset
 * @param category 
 * @param name 
 * @param fileName 
 * @returns 
 */
export function getAssetURL(category: string, name: string, fileName: string): string{
    let url = cdn
    // if (process.env.dev_mode === "true")
    //     url = "http://localhost:8000/assets/"

    if(category.toLowerCase() === "weapon"){
        if(fileName === "baseicon.png")
            fileName = "base_avatar.png"

        if(fileName === "splash.png")
            fileName = "splash_art.png"

        return `${cdn}/assets/${category.toLowerCase()}s/${toKey(name)}/${toKey(name)}_${fileName}`
    }

    return `${cdn}/assets/${category.toLowerCase()}s/${toKey(name)}/${fileName}`
}

/**
 * Utility function to get the url for an asset from the cdn
 * @param path 
 * @returns 
 */
export function getCDNURL(path: string) {
    // if (process.env.dev_mode === "true")
    //         return "http://localhost:8000/" +  `${path}`
    return `https://raw.githubusercontent.com/lambdv/genshin-scraper/refs/heads/main/genshindata/public/${path}`
}
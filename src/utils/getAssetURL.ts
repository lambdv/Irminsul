import { toKey } from "@/utils/standardizers"
import path from "path"
import 'dotenv/config';

let cdn = "https://cdn.irminsul.moe/assets/"

/**
 * Utility function to get the url for an asset
 * @param category 
 * @param name 
 * @param fileName 
 * @returns 
 */
export function getAssetURL(category: string, name: string, fileName: string): string{
    //old naming convention adaptor
    if(category.toLowerCase() === "weapon"){
        if(fileName === "baseicon.png")
            fileName = "base_avatar.png"

        if(fileName === "splash.png")
            fileName = "splash_art.png"

        return `${cdn}${category.toLowerCase()}s/${toKey(name)}/${toKey(name)}_${fileName}`
    }

    return `${cdn}${category.toLowerCase()}s/${toKey(name)}/${fileName}`
}

/**
 * Utility function to get the url for an asset from the cdn
 * @param path 
 * @returns 
 */
export function getCDNURL(path: string) {
    // if (process.env.NODE_ENV === "development")
    //     return process.env.ASSET_PATH + `${path}`
    return `https://cdn.irminsul.moe/${path}`
}
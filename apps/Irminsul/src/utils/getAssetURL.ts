import { toKey } from "@/utils/standardizers"
/**
 * Utility function to get the url for an asset
 * @param category 
 * @param name 
 * @param fileName 
 * @returns 
 */
export function getAssetURL(category: string, name: string, fileName: string): string{
    const cdn = "https://cdn.irminsul.moe/assets/"

    //old naming convention adaptor
    if(category.toLowerCase() === "weapon"){
        if(fileName === "baseicon.png"){fileName = "base_avatar.png"}
        if(fileName === "splash.png"){fileName = "splash_art.png"}
        return `${cdn}${category.toLowerCase()}s/${toKey(name)}/${toKey(name)}_${fileName}`
    }

    return `${cdn}${category.toLowerCase()}s/${toKey(name)}/${fileName}`
}


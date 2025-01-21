import { toKey } from "@/utils/standardizers"
export function getAssetURL(category: string, name: string, fileName: string): string{
    if(category.toLowerCase() === "weapon")
        return `/assets/weapons/${toKey(name)}/${toKey(name)}_${fileName}`
    return `/assets/${category.toLowerCase()}s/${toKey(name)}/${fileName}`
}

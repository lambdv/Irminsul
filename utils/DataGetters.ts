"use server";

/**
 * fetches character data from the database api
 * @returns array of character json objects
 */
export async function getCharacters(){
    return getFrom('https://genshin.jmp.blue/characters')
}

/**
 * fetches weapon data from the database api
 * @returns array of weapon json objects
 */
export async function getWeapons(){
    return getFrom('https://genshin.jmp.blue/weapons')
}

/**
 * fetches artifact data from the database api
 * @returns array of artifact json objects
 */
export async function getArtifacts(){
    return getFrom('https://genshin.jmp.blue/artifacts')
}


async function getFrom(url){
    const res = await fetch(url, {
        next: {
            revalidate: 60 * 60 * 24 * 7 // weekly
        }
    })
    const weapons = await res.json()
    const weaponDataPromises = weapons.map(async (weapon) => {
        const weaponData = await fetch(url+`/${weapon}`, {
            next: {
                revalidate: 60 * 60 * 24 * 7 // weekly
            }
        })
        return weaponData.json();
    })
    const weaponDataList = await Promise.all(weaponDataPromises);
    return weaponDataList;
}

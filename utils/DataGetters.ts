"use server"

/**
 * fetches character data from the database api
 * @returns array of character json objects
 */
export async function getCharacters(){
    "use cache"
    return getFrom('https://genshin.jmp.blue/characters')
}
    
export async function getCharacter(id: string){
    "use cache"
    return await fetch(`https://genshin.jmp.blue/characters/${id}`, {
        next: {
            revalidate: 60 * 60 * 24 * 7 // weekly
        }
    }).then(res => res.json())
}

/**
 * fetches weapon data from the database api
 * @returns array of weapon json objects
 */
export async function getWeapons(){
    "use cache"
    return getFrom('https://genshin.jmp.blue/weapons')
}

export async function getWeapon(id: string){
    "use cache"
    return await fetch(`https://genshin.jmp.blue/weapons/${id}`, {
        next: {
            revalidate: 60 * 60 * 24 * 7 // weekly
        }
    }).then(res => res.json())
}

/**
 * fetches artifact data from the database api
 * @returns array of artifact json objects
 */
export async function getArtifacts(){
    "use cache"
    return getFrom('https://genshin.jmp.blue/artifacts')
}

export async function getArtifact(id: string){
    "use cache"
    return await fetch(`https://genshin.jmp.blue/artifacts/${id}`, {
        next: {
            revalidate: 60 * 60 * 24 * 7 // weekly
        }
    }).then(res => res.json())
}

/**
 * helper method that fetches data from an api 
 */
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

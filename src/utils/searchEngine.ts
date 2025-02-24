// "use server"

// import { Page } from "@/types/page"


// const alterntiveNamesMapping = [
//     { "Tartaglia": ["childe", "ajax"]},
//     { "Tenacity of the Millelith": ["tom"]},
//     { "Fleuve Cendre Ferryman": ["pipe"]},
// ]

// export function foundMatch(query: string, page: Page){
//     const pageName = page.name.toLowerCase()
//     const queryLower = query.toLowerCase()
    
//     // Check for exact match first, preserving spaces
//     if (pageName.includes(queryLower)) {
//         return true
//     }

//     // Check alternative names
//     const alternativeNames = alterntiveNamesMapping.find(mapping => 
//         Object.keys(mapping)[0] === page.name
//     )
//     if (alternativeNames) {
//         const aliases = Object.values(alternativeNames)[0]
//         if (aliases.some(alias => alias.toLowerCase().includes(queryLower))) {
//             return true
//         }
//     }

//     // Split into words for acronym and word matching
//     const pageWords = pageName.split(' ')
//     const queryWords = queryLower.split(' ')

//     // Check for acronym match (e.g. both "ttods" and "ttds" match "Thrilling Tales of Dragon Slayers")
//     const acronyms = [
//         pageWords.map(word => word[0]).join(''), // Full acronym
//         pageWords.map(word => word[0]).filter(c => c !== 'o').join('') // Acronym without 'o'
//     ]
//     if (acronyms.some(acronym => acronym.includes(queryLower))) {
//         return true
//     }

//     // Generate common abbreviations (e.g. "xq" for "xingqiu")
//     const abbreviations = pageWords.map(word => {
//         // Take first letter and first consonant after first letter
//         const letters = word.split('')
//         const firstLetter = letters[0]
//         const secondConsonant = letters.slice(1).find(c => !'aeiou'.includes(c))
//         return firstLetter + (secondConsonant || '')
//     }).join('')

//     // Check if query matches start of any word or abbreviation
//     if (pageWords.some(word => word.toLowerCase().startsWith(queryLower)) || 
//         abbreviations.toLowerCase().includes(queryLower)) {
//         return true
//     }

//     // Check if all query words (including spaces) match parts of words in sequence
//     let currentPos = 0
//     for (const queryWord of queryWords) {
//         // Look for match starting from current position
//         let found = false
//         while (currentPos < pageName.length) {
//             if (pageName.slice(currentPos).startsWith(queryWord)) {
//                 currentPos += queryWord.length
//                 found = true
//                 break
//             }
//             currentPos++
//         }
//         if (!found) return false
//     }
//     return true
// }

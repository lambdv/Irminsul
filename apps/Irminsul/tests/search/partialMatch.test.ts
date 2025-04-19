import '@testing-library/jest-dom'
import { partialMatch } from "@/components/navigation/SearchPallete"

describe('partialMatch', () => {
    
    it('Thrilling Tales of Dragon Slayers matches ttds', () => {
        const query = 'ttds'
        const target = 'Thrilling Tales of Dragon Slayers'
        expect(partialMatch(query, target)).toBe(true)
    })

    it('Thrilling Tales of Dragon Slayers matches ttods', () => {
        const query = 'ttods'
        const target = 'Thrilling Tales of Dragon Slayers'
        expect(partialMatch(query, target)).toBe(true)
    })

    it('Favonius Lances matches fav lances', () => {
        const query = 'fav lances'
        const target = 'Favonius Lances'
        expect(partialMatch(query, target)).toBe(true)
    })

    it('Tenacity of the Millelith matches totm', () => {
        const query = 'totm'
        const target = 'Tenacity of the Millelith'
        expect(partialMatch(query, target)).toBe(true)
    })

    it('The black sword does not match blacks sword', () => {
        const query = 'blacks sword'
        const target = 'The black sword'
        expect(partialMatch(query, target)).toBe(false)
    })


})

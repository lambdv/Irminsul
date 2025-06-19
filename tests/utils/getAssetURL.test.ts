import '@testing-library/jest-dom'
// import { render, screen } from '@testing-library/react'
import { getAssetURL } from '@/utils/getAssetURL'

describe('getAssetURL', () => {
    const cdn = 'https://cdn.irminsul.moe/assets/'
    
    it('returns the correct image url for a character', async () => {
        const url = getAssetURL('Character', 'Nahida', 'avatar.png')
        expect(url).toBe(`${cdn}characters/nahida/avatar.png`)
    })

    it('returns the correct image url for a artifact', async () => {
        const url = getAssetURL('Artifact', 'Adventurer', 'base_avatar.png')
        expect(url).toBe(`${cdn}artifacts/adventurer/base_avatar.png`)
    })

    it('returns the correct image url for a weapon', async () => {
        const url = getAssetURL('Weapon', 'A Thousand Blazing Suns', 'base_avatar.png')
        expect(url).toBe(`${cdn}weapons/a-thousand-blazing-suns/a-thousand-blazing-suns_base_avatar.png`)
    })
})

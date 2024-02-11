import { create } from 'zustand';

export const CharacterFilterStore = create((set) => ({
    selectedCharacterFilters: [],
    setSelectedCharacterFilters: (newFilters) => set((state) => {
        return { selectedCharacterFilters: newFilters }
    }),
    possibleCharacterRarityFilters: ["5-star", "4-star"],
    possibleCharacterElementFilters: ["Pyro", "Hydro", "Dendro", "Electro", "Anemo", "Cryo", "Geo"],
    possibleCharacterWeaponFilters: ["Sword", "Claymore", "Bow", "Polearm", "Catalyst"],
    possibleCharacterStatFilters: ["ATK", "DEF", "HP", "Crit Rate", "Crit DMG", "Elemental Mastery", "Energy Recharge"]
}))
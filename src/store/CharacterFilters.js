import { create } from 'zustand';

export const CharacterFilterStore = create((set) => ({
    selectedCharacterFilters: [],
    setSelectedCharacterFilters: (newFilters) => set((state) => {
        return { selectedCharacterFilters: newFilters }
    }),
    posibleCharacterRarityFilters: ["5-star", "4-star"],
    posibleCharacterElementFilters: ["Pyro", "Hydro", "Dendro", "Electro", "Anemo", "Cryo", "Geo"],
    posibleCharacterWeaponFilters: ["Sword", "Claymore", "Bow", "Polearm", "Catalyst"],
    posibleCharacterStatFilters: ["ATK", "DEF", "HP", "Crit Rate", "Crit DMG", "Elemental Mastery", "Energy Recharge"]
}))
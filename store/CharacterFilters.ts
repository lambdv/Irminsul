import { create } from 'zustand';

type State = {
    selectedCharacterFilters: string[];
    setSelectedCharacterFilters: (newFilters: string[]) => void;
    possibleCharacterRarityFilters: string[];
    possibleCharacterElementFilters: string[];
    possibleCharacterWeaponFilters: string[];
    possibleCharacterStatFilters: string[];
};

export const CharacterFilterStore = create<State>((set) => ({
    selectedCharacterFilters: [],
    setSelectedCharacterFilters: (newFilters) => set((state) => {
        return { selectedCharacterFilters: newFilters }
    }),
    possibleCharacterRarityFilters: ["5-star", "4-star"],
    possibleCharacterElementFilters: ["Pyro", "Hydro", "Dendro", "Electro", "Anemo", "Cryo", "Geo"],
    possibleCharacterWeaponFilters: ["Sword", "Claymore", "Bow", "Polearm", "Catalyst"],
    possibleCharacterStatFilters: ["ATK", "DEF", "HP", "Crit Rate", "Crit DMG", "Elemental Mastery", "Energy Recharge", "Healing Bonus", "Physical DMG Bonus", "Pyro DMG Bonus", "Hydro DMG Bonus", "Dendro DMG Bonus", "Electro DMG Bonus", "Anemo DMG Bonus", "Cryo DMG Bonus", "Geo DMG Bonus"],
}))
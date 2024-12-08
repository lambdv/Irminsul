import { create } from 'zustand';

const CharacterFilterStore = create<{
    rarityFilters: string[];
    elementFilters: string[];
    weaponFilters: string[];
    statFilters: string[];
    selectedFilters: string[];
    setSelectedFilters: (newFilters: string[]) => void;
}>((set) => ({
    rarityFilters: ["5-star", "4-star"],
    elementFilters: ["Pyro", "Hydro", "Dendro", "Electro", "Anemo", "Cryo", "Geo"],
    weaponFilters: ["Sword", "Claymore", "Bow", "Polearm", "Catalyst"],
    statFilters: ["ATK", "DEF", "HP", "Crit Rate", "Crit DMG", "Elemental Mastery", "Energy Recharge", "Healing Bonus", "Physical DMG Bonus", "Pyro DMG Bonus", "Hydro DMG Bonus", "Dendro DMG Bonus", "Electro DMG Bonus", "Anemo DMG Bonus", "Cryo DMG Bonus", "Geo DMG Bonus"],
    
    selectedFilters: [],
    setSelectedFilters: (newFilters) => set((state) => {
        return { selectedFilters: newFilters }
    }),

}));

const WeaponFilterStore = create<{
    rarityFilters: string[];
    typeFilters: string[];
    statFilters: string[];
    selectedFilters: string[];
    setSelectedFilters: (newFilters: string[]) => void;
}>((set) => ({
    rarityFilters: ["5-star", "4-star"],
    typeFilters: ["Sword", "Claymore", "Bow", "Polearm", "Catalyst"],
    statFilters: ["ATK", "DEF", "HP", "Crit Rate", "Crit DMG", "Elemental Mastery", "Energy Recharge", "Healing Bonus", "Physical DMG Bonus", "Pyro DMG Bonus", "Hydro DMG Bonus", "Dendro DMG Bonus", "Electro DMG Bonus", "Anemo DMG Bonus", "Cryo DMG Bonus", "Geo DMG Bonus"],
    selectedFilters: [],
    setSelectedFilters: (newFilters) => set((state) => {
        return { selectedFilters: newFilters }
    }),
}));


const ArtifactFilterStore = create<{
    rarityFilters: string[];
    selectedFilters: string[];
    setSelectedFilters: (newFilters: string[]) => void;
}>((set) => ({
    rarityFilters: ["5-star", "4-star"],
    selectedFilters: [],
    setSelectedFilters: (newFilters) => set((state) => {
        return { selectedFilters: newFilters }
    }),
}));

export { CharacterFilterStore, WeaponFilterStore, ArtifactFilterStore };
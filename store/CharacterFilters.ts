"use client";
import { create } from 'zustand';

type State = {
    selectedFilters: string[];
    setSelectedFilters: (newFilters: string[]) => void;
    rarities: string[];
    elements: string[];
    weapons: string[];
    ascensionstats: string[];
    filters: any[];
};

export const CharacterFilterStore = create<State>((set) => ({
    selectedFilters: [],
    setSelectedFilters: (newFilters) => set((state) => {
        return { selectedFilters: newFilters }
    }),
    rarities: ["5-star", "4-star"],
    elements: ["Pyro", "Hydro", "Dendro", "Electro", "Anemo", "Cryo", "Geo"],
    weapons: ["Sword", "Claymore", "Bow", "Polearm", "Catalyst"],
    ascensionstats: ["ATK", "DEF", "HP", "Crit Rate", "Crit DMG", "Elemental Mastery", "Energy Recharge", "Healing Bonus", "Physical DMG Bonus", "Pyro DMG Bonus", "Hydro DMG Bonus", "Dendro DMG Bonus", "Electro DMG Bonus", "Anemo DMG Bonus", "Cryo DMG Bonus", "Geo DMG Bonus"],
    filters: [
        { rarities: ["5-star", "4-star"] }, 
        { elements: ["Pyro", "Hydro", "Dendro", "Electro", "Anemo", "Cryo", "Geo"] }, 
        { weapons: ["Sword", "Claymore", "Bow", "Polearm", "Catalyst"] }, 
        { ascensionstats: ["ATK", "DEF", "HP", "Crit Rate", "Crit DMG", "Elemental Mastery", "Energy Recharge", "Healing Bonus", "Physical DMG Bonus", "Pyro DMG Bonus", "Hydro DMG Bonus", "Dendro DMG Bonus", "Electro DMG Bonus", "Anemo DMG Bonus", "Cryo DMG Bonus", "Geo DMG Bonus"] }
    ]
}))
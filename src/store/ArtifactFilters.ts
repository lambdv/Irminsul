"use client";
import { create } from 'zustand';

type State = {
    selectedFilters: string[];
    setSelectedFilters: (newFilters: string[]) => void;
    // rarities: string[];
    filters: any[];
};

export const ArtifactFilterStore = create<State>((set) => ({

    selectedFilters: [],
    setSelectedFilters: (newFilters) => set((state) => {
        return { selectedFilters: newFilters }
    }),

    // rarities: ["5-star", "4-star", "3-star", "2-star", "1-star"],
    filters: [
        { rarities: ["5-star", "4-star", "3-star", "2-star", "1-star"] },
        { mainStats: ["HP", "ATK", "DEF", "HP%", "ATK%", "DEF%", "Elemental Mastery", "Energy Recharge", "Crit Rate", "Crit DMG"] },
    ]

}))
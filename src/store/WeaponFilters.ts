"use client";
import { create } from 'zustand';

type State = {
    selectedFilters: string[];
    setSelectedFilters: (newFilters: string[]) => void;
    // rarities: string[];
    // weapons: string[];
    // stats: string[];
    filters: any[];
};

export const WeaponFilterStore = create<State>((set) => ({
    selectedFilters: [],
    setSelectedFilters: (newFilters) => set((state) => {
        return { selectedFilters: newFilters }
    }),
    // rarities: ["5-star", "4-star", "3-star", "2-star", "1-star"],
    // weapons: ["Sword", "Claymore", "Bow", "Polearm", "Catalyst"],
    // stats: ["ATK", "DEF", "HP", "Crit Rate", "Crit DMG", "Elemental Mastery", "Energy Recharge"],
    filters: [
        { rarities: ["5-star", "4-star", "3-star", "2-star", "1-star"] }, 
        { weapons: ["Sword", "Claymore", "Bow", "Polearm", "Catalyst"] }, 
        { stats: ["ATK", "DEF", "HP", "CRIT Rate", "CRIT DMG", "Elemental Mastery", "Energy Recharge"] }
    ]
})) 
import { create } from 'zustand';

type State = {
    selectedWeaponFilters: string[];
    setSelectedWeaponFilters: (newFilters: string[]) => void;
    possibleWeaponRarityFilters: string[];
    possibleWeaponTypeFilters: string[];
    possibleWeaponStatFilters: string[];
};

export const WeaponFilterStore = create<State>((set) => ({
    selectedWeaponFilters: [],
    setSelectedWeaponFilters: (newFilters) => set((state) => {
        return { selectedWeaponFilters: newFilters }
    }),
    possibleWeaponRarityFilters: ["5-star", "4-star", "3-star", "2-star", "1-star"],
    possibleWeaponTypeFilters: ["Sword", "Claymore", "Bow", "Polearm", "Catalyst"],
    possibleWeaponStatFilters: ["ATK", "DEF", "HP", "Crit Rate", "Crit DMG", "Elemental Mastery", "Energy Recharge"],
})) 
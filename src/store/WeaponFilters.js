import { create } from 'zustand';
export const WeaponFilterStore = create((set) => ({
    selectedWeaponFilters: [],
    setSelectedWeaponFilters: (newFilters) => set((state) => {
        return { selectedWeaponFilters: newFilters }
    }),
    possibleWeaponRarityFilters: ["5-star", "4-star", "3-star", "2-star", "1-star"],
    possibleWeaponTypeFilters: ["Sword", "Claymore", "Bow", "Polearm", "Catalyst"],
    possibleWeaponStatFilters: ["ATK", "DEF", "HP", "Crit Rate", "Crit DMG", "Elemental Mastery", "Energy Recharge"],
})) 
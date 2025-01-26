"use client"

import { create } from 'zustand';
type State = {
    selectedFilters: string[];
    setSelectedFilters: (newFilters: string[]) => void;
    filters: any[];
    descending: boolean;
    setDescending: (newDescending: boolean) => void;
  };
  
export const ArticleFitlerStore = create<State>((set) => ({
  
    selectedFilters: [],
    setSelectedFilters: (newFilters) => set((state) => {
        return { selectedFilters: newFilters }
    }),
  
    filters: [
        { rarities: ["5-star", "4-star", "3-star", "2-star", "1-star"] },
        { mainStats: ["HP", "ATK", "DEF", "HP%", "ATK%", "DEF%", "Elemental Mastery", "Energy Recharge", "Crit Rate", "Crit DMG"] },
    ],
    descending: true,
    setDescending: (newDescending) => set((state) => {
        return { descending: newDescending }
    })
  
  }))
  
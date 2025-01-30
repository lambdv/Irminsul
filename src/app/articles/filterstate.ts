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
        {type: ["Blog", "Character Guide", "Literature Review", "Meta Analysis"]}
    ],
    descending: true,
    setDescending: (newDescending) => set((state) => {
        return { descending: newDescending }
    })
  
  }))
  
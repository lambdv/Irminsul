import { create } from 'zustand';

export const ArtifactFilterStore = create((set) => ({

    selectedArtifactFilters: [],
    setSelectedArtifactFilters: (newFilters) => set((state) => {
        return { selectedArtifactFilters: newFilters }
    }),

    posibleArtifactRarityFilters: ["5-star", "4-star", "3-star", "2-star", "1-star"],

}))
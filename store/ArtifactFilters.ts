import { create } from 'zustand';

type State = {
    selectedArtifactFilters: string[];
    setSelectedArtifactFilters: (newFilters: string[]) => void;
    possibleArtifactRarityFilters: string[];
};

export const ArtifactFilterStore = create<State>((set) => ({

    selectedArtifactFilters: [],
    setSelectedArtifactFilters: (newFilters) => set((state) => {
        return { selectedArtifactFilters: newFilters }
    }),

    possibleArtifactRarityFilters: ["5-star", "4-star", "3-star", "2-star", "1-star"],

}))
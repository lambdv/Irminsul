import { create } from 'zustand'

type State = {
    SearchQuery: string
    setSearchQuery: (query: string) => void
    updateQuery: (e: any) => void
    showPallette: boolean
    setShowPallette: (show: boolean) => void
    togglePalette: () => void
};

export const SearchStore = create<State>((set) => ({
    SearchQuery: "",
    setSearchQuery: (query: string) => set((state) => {
        return { SearchQuery: query }
    }),
    updateQuery: (e: any) => {
        set({SearchQuery: e.target.value});
    },
    showPallette: false,
    setShowPallette: (show: boolean) => set({ showPallette: show }),
    togglePalette: () => set((state) => {
        return { showPallette: !state.showPallette }
    })
}));



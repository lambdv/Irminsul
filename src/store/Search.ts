import { create } from 'zustand'

type State = {
    SearchQuery: string
    setSearchQuery: (query: string) => void
    updateQuery: (e: any) => void
    showPallette: boolean
    setShowPallette: (show: boolean) => void
    togglePalette: () => void
    firstKeyPress: boolean
    setFirstKeyPress: (firstKeyPress: boolean) => void
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
    setShowPallette: (show: boolean) => { 
        if(!show){
            set({ firstKeyPress: true })
        }
        set({ showPallette: show })
        
    },
    togglePalette: () => set((state) => {
        if(!state.showPallette){
            set({ firstKeyPress: true })
        }
        return { showPallette: !state.showPallette }
    }),
    firstKeyPress: true,
    setFirstKeyPress: (firstKeyPress: boolean) => set({ firstKeyPress: firstKeyPress })
}));



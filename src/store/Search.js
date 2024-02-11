import { create } from 'zustand';

export const SearchStore = create((set) => ({
    SearchQuery: "",
    setSearchQuery: (query) => set((state) => {
        return { SearchQuery: query }
    }),
    updateQuery: (e) => set((state) => {
        return { SearchQuery: e.target.value }
    }),

}))
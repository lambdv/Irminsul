import { create } from 'zustand';

type State = {
    SearchQuery: string;
    setSearchQuery: (query: string) => void;
    updateQuery: (e: any) => void;
};

export const SearchStore = create<State>((set) => ({
    SearchQuery: "",
    setSearchQuery: (query: string) => set((state) => {
        return { SearchQuery: query }
    }),
    updateQuery: (e: any) => {
        e.target.select();
        set({SearchQuery: e.target.value});
    },
}));



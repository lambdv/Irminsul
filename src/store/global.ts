import { create } from 'zustand';

type State = {
    isSupporter: boolean;
    setIsSupporter: (isSupporter: boolean) => void;
};

export const GlobalStore = create<State>((set) => ({
    isSupporter: false,
    setIsSupporter: (isSupporter) => set({ isSupporter }),
}));
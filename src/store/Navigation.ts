import { create } from 'zustand';

type State = {
    sideNavCollapsed: boolean;
    setSideNavCollapsed: (collapsed: boolean) => void;
    toggleSideNavCollapsed: () => void;
};

export const NavigationStore = create<State>((set) => ({
    sideNavCollapsed: true,
    setSideNavCollapsed: (collapsed) => set((state) => ({ sideNavCollapsed: collapsed })),
    toggleSideNavCollapsed: () => set((state) => ({
         sideNavCollapsed: !state.sideNavCollapsed 
    })),
}));
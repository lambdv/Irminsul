import { create } from "zustand"

type Tier = "free" | "pro" | "ultra"

type State = {
  isSupporter: boolean
  userTier: Tier
  setIsSupporter: (isSupporter: boolean) => void
  setUserTier: (userTier: Tier) => void
}

export const GlobalStore = create<State>((set) => ({
  isSupporter: false,
  userTier: "free",
  setIsSupporter: (isSupporter) => set({ isSupporter }),
  setUserTier: (userTier) => set({ userTier }),
}))

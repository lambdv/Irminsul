"use client";
import { create } from 'zustand';


export type CharacterSpec = {
    name: string;
    level: number;
    naTalent: number;
    skillTalent: number;
    burstTalent: number;
    //constellation: number;
}

type State = {
    selectedCharacter: string;
    setSelectedCharacter: (newCharacter: string) => void;
    selectedWeapon: string;
    setSelectedWeapon: (newWeapon: string) => void;
    selectedArtifact: string;
    setSelectedArtifact: (newArtifact: string) => void;
    selectedEnemy: string;
    setSelectedEnemy: (newEnemy: string) => void;
};

export const WeaponFilterStore = create<State>((set) => ({
    selectedCharacter: "",
    setSelectedCharacter: (newCharacter) => set({ selectedCharacter: newCharacter }),
    selectedWeapon: "",
    setSelectedWeapon: (newWeapon) => set({ selectedWeapon: newWeapon }),
    selectedArtifact: "",
    setSelectedArtifact: (newArtifact) => set({ selectedArtifact: newArtifact }),
    selectedEnemy: "",
    setSelectedEnemy: (newEnemy) => set({ selectedEnemy: newEnemy }),
})) 
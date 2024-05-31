import { create } from "zustand";

type viewingLeftOrRight = {
    // leftOrRight: "left" | "right";
    selectedLeft: boolean;
    placeholderNeeded: boolean;
    setSelectedLeft: (viewing: boolean) => void;
    setPlaceholderNeeded: (viewing: boolean) => void;
};
export const useMobileStore = create<viewingLeftOrRight>((set) => ({
    // leftOrRight: "left",
    selectedLeft: true,
    placeholderNeeded: true,
    setSelectedLeft: (viewing) => set({ selectedLeft: viewing }),
    setPlaceholderNeeded: (viewing) => set({ placeholderNeeded: viewing }),
}));
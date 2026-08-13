"use client";
import { create } from "zustand";

interface UIState {
  isQuickAddOpen: boolean;
  quickAddType: "income" | "expense" | "transfer";
  openQuickAdd: (type?: "income" | "expense" | "transfer") => void;
  closeQuickAdd: () => void;
  isAIImportOpen: boolean;
  openAIImport: () => void;
  closeAIImport: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isQuickAddOpen: false,
  quickAddType: "expense",
  openQuickAdd: (type = "expense") => set({ isQuickAddOpen: true, quickAddType: type }),
  closeQuickAdd: () => set({ isQuickAddOpen: false }),
  isAIImportOpen: false,
  openAIImport: () => set({ isAIImportOpen: true }),
  closeAIImport: () => set({ isAIImportOpen: false }),
}));

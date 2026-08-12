"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WorkspaceOption } from "@/types";

interface WorkspaceState {
  workspaces: WorkspaceOption[];
  currentWorkspaceId: string | null;
  setWorkspaces: (workspaces: WorkspaceOption[]) => void;
  setCurrentWorkspaceId: (id: string) => void;
  currentWorkspace: () => WorkspaceOption | undefined;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      currentWorkspaceId: null,
      setWorkspaces: (workspaces) => {
        const currentId = get().currentWorkspaceId;
        const stillExists = workspaces.some((w) => w.id === currentId);
        set({
          workspaces,
          currentWorkspaceId: stillExists ? currentId : workspaces[0]?.id ?? null,
        });
      },
      setCurrentWorkspaceId: (id) => set({ currentWorkspaceId: id }),
      currentWorkspace: () => get().workspaces.find((w) => w.id === get().currentWorkspaceId),
    }),
    { name: "spending-flows-workspace" }
  )
);

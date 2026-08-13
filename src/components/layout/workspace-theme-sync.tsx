"use client";

import { useEffect } from "react";
import { applyAccentTheme, DEFAULT_ACCENT_COLOR } from "@/lib/theme";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function WorkspaceThemeSync() {
  const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const setHasHydrated = useWorkspaceStore((state) => state.setHasHydrated);

  useEffect(() => {
    let active = true;

    void Promise.resolve(useWorkspaceStore.persist.rehydrate()).finally(() => {
      if (active) setHasHydrated(true);
    });

    return () => {
      active = false;
    };
  }, [setHasHydrated]);

  useEffect(() => {
    const workspace = workspaces.find((item) => item.id === currentWorkspaceId);
    applyAccentTheme(document.documentElement, workspace?.accent_color ?? DEFAULT_ACCENT_COLOR);
  }, [currentWorkspaceId, workspaces]);

  return null;
}

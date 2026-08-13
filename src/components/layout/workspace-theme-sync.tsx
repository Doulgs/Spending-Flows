"use client";

import { useEffect } from "react";
import { applyAccentTheme, DEFAULT_ACCENT_COLOR } from "@/lib/theme";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function WorkspaceThemeSync() {
  const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);
  const workspaces = useWorkspaceStore((state) => state.workspaces);

  useEffect(() => {
    const workspace = workspaces.find((item) => item.id === currentWorkspaceId);
    applyAccentTheme(document.documentElement, workspace?.accent_color ?? DEFAULT_ACCENT_COLOR);
  }, [currentWorkspaceId, workspaces]);

  return null;
}

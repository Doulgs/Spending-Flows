"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    createClient().auth.getUser().then(({ data }) => mounted && setUser(data.user ?? null));
    return () => { mounted = false; };
  }, []);

  const displayName = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "Usuário";
  const avatarUrl = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture;
  const initials = displayName.split(" ").slice(0, 2).map((part: string) => part.charAt(0)).join("").toUpperCase();
  return { user, displayName, avatarUrl, initials: initials || "SF" };
}

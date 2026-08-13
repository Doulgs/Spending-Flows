"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FeatureFlagKey } from "@/lib/feature-flags";

export function useFeatureFlag(flagKey: FeatureFlagKey) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const { data, error: requestError } = await createClient().rpc("is_feature_enabled", { flag_key: flagKey });
      if (!active) return;
      setEnabled(requestError ? false : data === true);
      setError(requestError ? new Error(requestError.message) : null);
      setLoading(false);
    }

    void load();
    return () => { active = false; };
  }, [flagKey]);

  return { enabled, loading, error };
}

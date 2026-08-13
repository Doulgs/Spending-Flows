import { redirect } from "next/navigation";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id")
    .limit(1);

  if (workspaces?.length) redirect("/dashboard");

  const { data: onboardingEnabled, error: flagError } = await supabase.rpc("is_feature_enabled", {
    flag_key: FEATURE_FLAGS.ONBOARDING,
  });
  if (flagError || onboardingEnabled) redirect("/onboarding");

  const { error: workspaceError } = await supabase.rpc("ensure_default_workspace");
  if (workspaceError) redirect("/onboarding");
  redirect("/dashboard");
}

"use client";
import { createClient } from "@/lib/supabase/client";

export async function signInWithGoogle(next = "/") {
  const supabase = createClient();
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) throw error;
  return data;
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithPassword(name: string, email: string, password: string) {
  const supabase = createClient();
  const { data: signupEnabled, error: flagError } = await supabase.rpc("is_feature_enabled", { flag_key: "email_signup" });
  if (flagError || !signupEnabled) throw new Error("A criação de contas por e-mail está temporariamente indisponível.");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.replace("/login");
}

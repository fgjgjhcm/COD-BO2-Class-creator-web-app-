"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { claimUsernameAction } from "@/lib/community/actions";

export function LoginClient({
  needsUsername,
  configured,
}: {
  needsUsername: boolean;
  configured: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/community";
  const errorParam = searchParams.get("error");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(
    errorParam === "auth"
      ? "Sign-in failed. Try again."
      : errorParam === "not_configured"
        ? "Community auth is not configured yet."
        : null,
  );
  const [pending, startTransition] = useTransition();

  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return "";
    const url = new URL("/auth/callback", window.location.origin);
    url.searchParams.set("next", next);
    return url.toString();
  }, [next]);

  async function signIn(provider: "discord" | "google") {
    setError(null);
    if (!configured || !isSupabaseConfigured()) {
      setError("Community auth is not configured yet.");
      return;
    }
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (oauthError) setError(oauthError.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    }
  }

  function claimUsername(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await claimUsernameAction(username);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.replace(next);
      router.refresh();
    });
  }

  if (needsUsername) {
    return (
      <form className="community-auth-panel" onSubmit={claimUsername}>
        <p className="seo-eyebrow">Callsign</p>
        <h1 className="seo-title">Choose a username</h1>
        <p className="seo-lead">
          This is how you show up on Community loadouts. 3–20 characters, letters,
          numbers, underscore.
        </p>
        <label className="community-field">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
            autoComplete="username"
            spellCheck={false}
            required
            placeholder="operative_name"
          />
        </label>
        {error ? <p className="community-error">{error}</p> : null}
        <button type="submit" className="seo-cta seo-cta-lg" disabled={pending}>
          {pending ? "Saving…" : "Confirm callsign"}
        </button>
      </form>
    );
  }

  return (
    <div className="community-auth-panel">
      <p className="seo-eyebrow">Operative Access</p>
      <h1 className="seo-title">Sign in</h1>
      <p className="seo-lead">
        Required to publish, like, and save Community loadouts. Browsing and the
        class builder stay free.
      </p>
      {!configured ? (
        <p className="community-error">
          Supabase env vars are missing. Add NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY to enable auth.
        </p>
      ) : null}
      {error ? <p className="community-error">{error}</p> : null}
      <div className="community-auth-actions">
        <button
          type="button"
          className="seo-cta seo-cta-lg"
          onClick={() => signIn("discord")}
          disabled={!configured}
        >
          Continue with Discord
        </button>
        <button
          type="button"
          className="community-auth-secondary"
          onClick={() => signIn("google")}
          disabled={!configured}
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}

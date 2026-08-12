"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { claimUsernameAction } from "@/lib/community/actions";

type AuthMode = "signin" | "signup";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    errorParam === "auth"
      ? "Sign-in failed. Try again."
      : errorParam === "not_configured"
        ? "Community auth is not configured yet."
        : null,
  );
  const [pending, startTransition] = useTransition();
  const [oauthPending, setOauthPending] = useState<"discord" | "google" | null>(
    null,
  );

  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return "";
    const url = new URL("/auth/callback", window.location.origin);
    url.searchParams.set("next", next);
    return url.toString();
  }, [next]);

  async function finishSession() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Sign-in failed.");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.username) {
      router.replace(`/login?claim=1&next=${encodeURIComponent(next)}`);
      router.refresh();
      return;
    }
    router.replace(next);
    router.refresh();
  }

  async function signInOAuth(provider: "discord" | "google") {
    setError(null);
    setMessage(null);
    if (!configured || !isSupabaseConfigured()) {
      setError("Community auth is not configured yet.");
      return;
    }
    setOauthPending(provider);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (oauthError) {
        setError(oauthError.message);
        setOauthPending(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      setOauthPending(null);
    }
  }

  function submitEmail(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (!configured || !isSupabaseConfigured()) {
      setError("Community auth is not configured yet.");
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createClient();
        if (mode === "signup") {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: { emailRedirectTo: redirectTo },
          });
          if (signUpError) {
            setError(signUpError.message);
            return;
          }
          if (data.session) {
            await finishSession();
            return;
          }
          setMessage(
            "Account created. Check your email to confirm, then sign in.",
          );
          setMode("signin");
          return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) {
          setError(signInError.message);
          return;
        }
        await finishSession();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sign-in failed.");
      }
    });
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
      <h1 className="seo-title">{mode === "signup" ? "Create account" : "Sign in"}</h1>
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
      {message ? <p className="community-auth-message">{message}</p> : null}

      <div className="community-auth-actions">
        <button
          type="button"
          className="community-auth-provider"
          onClick={() => signInOAuth("discord")}
          disabled={!configured || oauthPending !== null || pending}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/auth/discord.png" alt="" width={22} height={22} />
          <span>
            {oauthPending === "discord"
              ? "Redirecting…"
              : "Continue with Discord"}
          </span>
        </button>
        <button
          type="button"
          className="community-auth-provider"
          onClick={() => signInOAuth("google")}
          disabled={!configured || oauthPending !== null || pending}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/auth/google.png" alt="" width={22} height={22} />
          <span>
            {oauthPending === "google" ? "Redirecting…" : "Continue with Google"}
          </span>
        </button>
      </div>

      <div className="community-auth-divider" role="separator">
        <span>or email</span>
      </div>

      <form className="community-auth-email" onSubmit={submitEmail}>
        <label className="community-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={!configured || pending}
          />
        </label>
        <label className="community-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={6}
            required
            disabled={!configured || pending}
          />
        </label>
        <button
          type="submit"
          className="seo-cta seo-cta-lg community-auth-email-submit"
          disabled={!configured || pending || oauthPending !== null}
        >
          {pending
            ? mode === "signup"
              ? "Creating…"
              : "Signing in…"
            : mode === "signup"
              ? "Create account"
              : "Sign in with email"}
        </button>
      </form>

      <p className="community-auth-switch">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              className="community-auth-switch-btn"
              onClick={() => {
                setMode("signin");
                setError(null);
                setMessage(null);
              }}
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            New operative?{" "}
            <button
              type="button"
              className="community-auth-switch-btn"
              onClick={() => {
                setMode("signup");
                setError(null);
                setMessage(null);
              }}
            >
              Create an account
            </button>
          </>
        )}
      </p>
    </div>
  );
}

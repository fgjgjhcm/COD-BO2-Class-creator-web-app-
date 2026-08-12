"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Profile } from "@/types/database";

export function AuthButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setReady(true);
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) {
          setProfile(null);
          setReady(true);
        }
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled) {
        setProfile(data);
        setReady(true);
      }
    }

    void load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return <span className="community-auth-slot" aria-hidden="true" />;
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!profile) {
    const next = encodeURIComponent(pathname || "/community");
    return (
      <Link href={`/login?next=${next}`} className="community-login-btn">
        Login
      </Link>
    );
  }

  if (!profile.username) {
    return (
      <Link href="/login?claim=1&next=/community" className="community-login-btn">
        Set username
      </Link>
    );
  }

  const label = profile.username;

  return (
    <div className="community-profile-menu">
      <button
        type="button"
        className="community-avatar-btn"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" width={28} height={28} />
        ) : (
          <span>{label.slice(0, 1).toUpperCase()}</span>
        )}
      </button>
      {open ? (
        <div className="community-profile-dropdown" role="menu">
          <Link
            href={`/community/user/${label}`}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <Link
            href="/community"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Community
          </Link>
          <button
            type="button"
            role="menuitem"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                setOpen(false);
                setProfile(null);
                router.refresh();
              });
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ClassBuild } from "@/types/class";
import { countUsedPoints } from "@/lib/pick10";
import { publishLoadoutAction } from "@/lib/community/actions";
import { LoadoutPreview } from "@/components/community/LoadoutPreview";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { UsernameGate } from "@/components/community/UsernameGate";

export function PublishLoadoutModal({
  open,
  onClose,
  build,
  remixOf,
  defaultTitle,
}: {
  open: boolean;
  onClose: () => void;
  build: ClassBuild;
  remixOf?: string | null;
  defaultTitle?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(defaultTitle || build.name || "");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [checking, setChecking] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setTitle(defaultTitle || build.name || "");
    setDescription("");
    setError(null);
    setNeedsUsername(false);

    if (!isSupabaseConfigured()) {
      setError("Community is not configured yet.");
      return;
    }

    let cancelled = false;
    setChecking(true);
    void (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) {
          onClose();
          router.push(
            `/login?next=${encodeURIComponent("/builder?publish=1")}`,
          );
        }
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled) {
        setNeedsUsername(!profile?.username);
        setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, build.name, defaultTitle, onClose, router]);

  if (!open) return null;

  const points = countUsedPoints(build);

  return (
    <div className="community-modal-backdrop" role="presentation">
      <div
        className="community-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-loadout-title"
      >
        <button
          type="button"
          className="community-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {checking ? (
          <p className="seo-lead">Checking session…</p>
        ) : needsUsername ? (
          <UsernameGate
            onDone={() => {
              setNeedsUsername(false);
            }}
          />
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              startTransition(async () => {
                const result = await publishLoadoutAction({
                  title,
                  description,
                  build,
                  remixOf: remixOf ?? null,
                });
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                onClose();
                router.push(`/community/loadout/${result.data.slug}`);
                router.refresh();
              });
            }}
          >
            <p className="seo-eyebrow">Community</p>
            <h2 id="publish-loadout-title" className="community-modal-title">
              Post loadout
            </h2>
            <p className="seo-lead">
              Publish your current Pick 10 class ({points}/10).
              {remixOf ? " This will be marked as a remix." : null}
            </p>

            <label className="community-field">
              <span>Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={64}
                required
              />
            </label>
            <label className="community-field">
              <span>Description (optional)</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </label>

            <LoadoutPreview build={build} />

            {error ? <p className="community-error">{error}</p> : null}

            <div className="community-modal-actions">
              <button type="button" className="community-action-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="seo-cta" disabled={pending}>
                {pending ? "Publishing…" : "Publish"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

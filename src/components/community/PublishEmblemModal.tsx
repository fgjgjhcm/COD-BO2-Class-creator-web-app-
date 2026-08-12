"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishEmblemAction } from "@/lib/community/actions";
import { EXTERNAL_EMBLEM_EDITOR_URL } from "@/lib/community/emblemLinks";
import { VisibilityToggle } from "@/components/community/VisibilityToggle";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { UsernameGate } from "@/components/community/UsernameGate";

const MAX_BYTES = 2 * 1024 * 1024;

export function PublishEmblemModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emblemCode, setEmblemCode] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [setAsCurrent, setSetAsCurrent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [checking, setChecking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDescription("");
    setEmblemCode("");
    setPreviewUrl(null);
    setIsPublic(true);
    setSetAsCurrent(true);
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
            `/login?next=${encodeURIComponent("/community/emblems?publish=1")}`,
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
  }, [open, onClose, router]);

  if (!open) return null;

  return (
    <div className="community-modal-backdrop" role="presentation">
      <div
        className="community-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-emblem-title"
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
          <UsernameGate onDone={() => setNeedsUsername(false)} />
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              startTransition(async () => {
                const result = await publishEmblemAction({
                  title,
                  description,
                  emblemCode,
                  previewUrl,
                  isPublic,
                  setAsCurrent,
                });
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                onClose();
                router.push(`/community/emblem/${result.data.slug}`);
                router.refresh();
              });
            }}
          >
            <p className="seo-eyebrow">Community</p>
            <h2 id="publish-emblem-title" className="community-modal-title">
              Post emblem
            </h2>
            <p className="seo-lead">
              Build in the{" "}
              <a
                href={EXTERNAL_EMBLEM_EDITOR_URL}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--accent)" }}
              >
                BO2 Emblem Editor
              </a>
              , hit SAVE, then paste the code here.
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
                rows={2}
              />
            </label>
            <label className="community-field">
              <span>Emblem SAVE code</span>
              <textarea
                value={emblemCode}
                onChange={(e) => setEmblemCode(e.target.value)}
                rows={5}
                spellCheck={false}
                required
                placeholder="Paste the long SAVE code from the emblem editor"
              />
            </label>

            <div className="community-avatar-edit" style={{ marginTop: "0.75rem" }}>
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt=""
                  className="community-emblem-preview-thumb"
                  width={72}
                  height={72}
                />
              ) : (
                <div className="community-emblem-preview-thumb community-emblem-preview-thumb--empty">
                  Preview
                </div>
              )}
              <div className="community-avatar-edit-actions">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (file.size > MAX_BYTES) {
                      setError("Preview must be 2MB or smaller.");
                      return;
                    }
                    setUploading(true);
                    setError(null);
                    void (async () => {
                      try {
                        const supabase = createClient();
                        const {
                          data: { user },
                        } = await supabase.auth.getUser();
                        if (!user) {
                          setError("Sign in required.");
                          return;
                        }
                        const ext =
                          file.type === "image/png"
                            ? "png"
                            : file.type === "image/webp"
                              ? "webp"
                              : file.type === "image/gif"
                                ? "gif"
                                : "jpg";
                        const path = `${user.id}/${Date.now()}.${ext}`;
                        const { error: uploadError } = await supabase.storage
                          .from("emblem-previews")
                          .upload(path, file, {
                            upsert: true,
                            contentType: file.type,
                          });
                        if (uploadError) {
                          setError(uploadError.message);
                          return;
                        }
                        const { data } = supabase.storage
                          .from("emblem-previews")
                          .getPublicUrl(path);
                        setPreviewUrl(data.publicUrl);
                      } catch (err) {
                        setError(
                          err instanceof Error ? err.message : "Upload failed.",
                        );
                      } finally {
                        setUploading(false);
                        if (fileRef.current) fileRef.current.value = "";
                      }
                    })();
                  }}
                />
                <button
                  type="button"
                  className="seo-cta"
                  disabled={uploading || pending}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? "Uploading…" : "Add preview image"}
                </button>
                <p className="community-field-hint">
                  Optional screenshot from the editor (recommended).
                </p>
              </div>
            </div>

            <VisibilityToggle
              isPublic={isPublic}
              onChange={setIsPublic}
              disabled={pending || uploading}
              name="emblem-visibility"
            />

            <label className="community-check">
              <input
                type="checkbox"
                checked={setAsCurrent}
                onChange={(e) => setSetAsCurrent(e.target.checked)}
                disabled={pending || uploading}
              />
              <span>Set as my current emblem (shows on profile + username hover)</span>
            </label>

            {error ? <p className="community-error">{error}</p> : null}

            <div className="community-modal-actions">
              <button
                type="button"
                className="community-action-btn"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="seo-cta"
                disabled={pending || uploading}
              >
                {pending ? "Publishing…" : isPublic ? "Publish" : "Save private"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

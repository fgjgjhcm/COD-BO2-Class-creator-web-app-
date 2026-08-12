"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateAvatarAction,
  updateProfileAction,
} from "@/lib/community/actions";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function extensionFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

export function ProfileEditForm({
  userId,
  initialDisplayName,
  initialBio,
  initialAvatarUrl,
}: {
  userId: string;
  initialDisplayName: string;
  initialBio: string;
  initialAvatarUrl: string | null;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [avatarPending, setAvatarPending] = useState(false);

  async function uploadAvatar(file: File) {
    setMessage(null);
    if (!ALLOWED_TYPES.has(file.type)) {
      setMessage("Use a JPG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setMessage("Image must be 2MB or smaller.");
      return;
    }

    setAvatarPending(true);
    try {
      const supabase = createClient();
      const path = `${userId}/${Date.now()}.${extensionFor(file.type)}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });
      if (uploadError) {
        setMessage(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const result = await updateAvatarAction({ avatarUrl: data.publicUrl });
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setAvatarUrl(result.data.avatarUrl);
      setMessage("Profile photo updated.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setAvatarPending(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <form
      className="community-profile-edit"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(null);
        startTransition(async () => {
          const result = await updateProfileAction({ displayName, bio });
          if (!result.ok) {
            setMessage(result.error);
            return;
          }
          setMessage("Profile updated.");
          router.refresh();
        });
      }}
    >
      <h2 className="seo-section-title">Edit profile</h2>

      <div className="community-avatar-edit">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="community-profile-avatar"
            width={72}
            height={72}
          />
        ) : (
          <div className="community-profile-avatar community-profile-avatar--fallback">
            ?
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
              if (file) void uploadAvatar(file);
            }}
          />
          <button
            type="button"
            className="seo-cta"
            disabled={avatarPending || pending}
            onClick={() => fileRef.current?.click()}
          >
            {avatarPending ? "Uploading…" : "Change photo"}
          </button>
          {avatarUrl ? (
            <button
              type="button"
              className="community-text-btn"
              disabled={avatarPending || pending}
              onClick={() => {
                setMessage(null);
                setAvatarPending(true);
                void (async () => {
                  const result = await updateAvatarAction({ avatarUrl: null });
                  setAvatarPending(false);
                  if (!result.ok) {
                    setMessage(result.error);
                    return;
                  }
                  setAvatarUrl(null);
                  setMessage("Profile photo removed.");
                  router.refresh();
                })();
              }}
            >
              Remove photo
            </button>
          ) : null}
          <p className="community-field-hint">JPG, PNG, WebP, or GIF · max 2MB</p>
        </div>
      </div>

      <label className="community-field">
        <span>Display name</span>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={40}
        />
      </label>
      <label className="community-field">
        <span>Bio</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={280}
          rows={3}
        />
      </label>
      {message ? <p className="community-inline-error">{message}</p> : null}
      <button type="submit" className="seo-cta" disabled={pending || avatarPending}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

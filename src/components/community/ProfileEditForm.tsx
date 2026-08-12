"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/lib/community/actions";

export function ProfileEditForm({
  initialDisplayName,
  initialBio,
}: {
  initialDisplayName: string;
  initialBio: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
      <button type="submit" className="seo-cta" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

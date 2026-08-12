"use client";

import { useState, useTransition } from "react";
import { claimUsernameAction } from "@/lib/community/actions";

export function UsernameGate({
  onDone,
}: {
  onDone?: (username: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="community-modal-panel"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await claimUsernameAction(username);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          onDone?.(result.data.username);
        });
      }}
    >
      <h2 className="community-modal-title">Choose a username</h2>
      <p className="seo-lead">Required before publishing to Community.</p>
      <label className="community-field">
        <span>Username</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={20}
          required
          spellCheck={false}
        />
      </label>
      {error ? <p className="community-error">{error}</p> : null}
      <button type="submit" className="seo-cta" disabled={pending}>
        {pending ? "Saving…" : "Confirm"}
      </button>
    </form>
  );
}
